import { EncodeObject, Registry } from "@cosmjs/proto-signing";
import { sha256 } from "@cosmjs/crypto";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { PubKey as Secp256k1PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { MsgCommunityPoolSpend } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgUpdateParams as StakingMsgUpdateParams } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { StakeAuthorization } from "cosmjs-types/cosmos/staking/v1beta1/authz";
import { SendAuthorization } from "cosmjs-types/cosmos/bank/v1beta1/authz";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgUpdateParams as GovMsgUpdateParams } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/tx";
import { MsgSoftwareUpgrade } from "@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/tx";
import { makeSignDoc, serializeSignDoc, StdFee } from "@cosmjs/amino";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
} from "@cosmjs/stargate";
import { SignAndBroadcastOptions } from "./TxCommon";
import { makeAuthInfoBytes } from "./signing";

// Two-tier Ledger debug logging.
//
// DEBUG_LEDGER=1 — structural tracing only: connect events, typeUrl, field
// names. Does NOT expose transaction contents. Safe to enable in shared
// staging environments.
//
// DEBUG_LEDGER_CBOR=1 — full transaction dump: rendered screens (addresses,
// amounts, memos) and CBOR hex bytes. Reveals every detail of the tx being
// signed. Do NOT enable in production or on shared hosts.
const DEBUG_LEDGER =
  (typeof process !== "undefined" && process.env?.DEBUG_LEDGER === "1") ||
  (typeof globalThis !== "undefined" && (globalThis as { DEBUG_LEDGER?: boolean }).DEBUG_LEDGER === true);

const DEBUG_LEDGER_CBOR =
  (typeof process !== "undefined" && process.env?.DEBUG_LEDGER_CBOR === "1") ||
  (typeof globalThis !== "undefined" && (globalThis as { DEBUG_LEDGER_CBOR?: boolean }).DEBUG_LEDGER_CBOR === true);

export interface LedgerWalletInterface {
  getAddress(): Promise<string>;
  sign(message: string | Uint8Array, txtype?: number): Promise<Uint8Array>;
  getPublicKey(): Promise<Uint8Array>;
  getAddressAndPublicKey(): Promise<{ address: string; publicKey: Uint8Array }>;
  showAddressOnDevice?(): Promise<void>;
}

export interface SignerData {
  readonly account_number: number;
  readonly sequence: number;
  readonly chain_id: string;
}

// ─── Minimal CBOR encoder ────────────────────────────────────────────────────

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function cborMajorN(major: number, n: number): Uint8Array {
  const type = major << 5;
  if (n <= 23) return new Uint8Array([type | n]);
  if (n <= 0xff) return new Uint8Array([type | 24, n]);
  if (n <= 0xffff) return new Uint8Array([type | 25, (n >> 8) & 0xff, n & 0xff]);
  const b = new Uint8Array(5);
  b[0] = type | 26;
  new DataView(b.buffer).setUint32(1, n, false);
  return b;
}

function cborUint(n: number): Uint8Array { return cborMajorN(0, n); }

function cborText(s: string): Uint8Array {
  const utf8 = new TextEncoder().encode(s);
  return concatBytes(cborMajorN(3, utf8.length), utf8);
}

interface TextualScreen {
  title?: string;
  content: string;
  indent?: number;
  expert?: boolean;
}

function encodeSingleScreen(s: TextualScreen): Uint8Array {
  const parts: Uint8Array[] = [];
  let n = 0;
  if (s.title) { parts.push(cborUint(1), cborText(s.title)); n++; }
  // always include content: Ledger parser requires key 2 after key 1 (title)
  parts.push(cborUint(2), cborText(s.content)); n++;
  if (s.indent && s.indent > 0) { parts.push(cborUint(3), cborUint(s.indent)); n++; }
  if (s.expert) { parts.push(cborUint(4), new Uint8Array([0xf5])); n++; }
  return concatBytes(cborMajorN(5, n), ...parts);
}

function encodeTextualCbor(screens: TextualScreen[]): Uint8Array {
  const items = screens.map(encodeSingleScreen);
  const arr = concatBytes(cborMajorN(4, screens.length), ...items);
  return concatBytes(cborMajorN(5, 1), cborUint(1), arr);
}

// ─── Coin metadata & formatting ───────────────────────────────────────────────

interface DenomUnit { denom: string; exponent: number; }
interface CoinMetadata { base: string; display: string; denom_units: DenomUnit[]; }
interface DenomsMetadataResponse { metadata?: CoinMetadata; }

async function queryCoinMetadata(restUrl: string, denom: string): Promise<CoinMetadata | null> {
  if (!restUrl) return null;
  try {
    const resp = await fetch(`${restUrl}/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(denom)}`);
    if (!resp.ok) return null;
    const data = await resp.json() as DenomsMetadataResponse;
    return data.metadata ?? null;
  } catch { return null; }
}

// Matches cosmos SDK math.FormatInt: adds apostrophe thousand separators
function formatIntWithSep(v: string): string {
  const neg = v.startsWith("-");
  const digits = neg ? v.slice(1) : v;
  if (digits.length <= 3) return v;
  const groups: string[] = [];
  const mod3 = digits.length % 3;
  let i = 0;
  if (mod3 !== 0) { groups.push(digits.slice(0, mod3)); i = mod3; }
  while (i < digits.length) { groups.push(digits.slice(i, i + 3)); i += 3; }
  return (neg ? "-" : "") + groups.join("'");
}

function formatOneCoin(amount: string, denom: string, meta: CoinMetadata | null): string {
  if (!meta) return `${formatIntWithSep(amount)} ${denom}`;
  const baseUnit = meta.denom_units.find((u) => u.denom === denom);
  const displayName = meta.display;
  const displayUnit = meta.denom_units.find(
    (u) => u.denom === displayName || u.denom === displayName.toLowerCase(),
  );
  if (!baseUnit || !displayUnit) return `${formatIntWithSep(amount)} ${displayName || denom}`;
  const exp = displayUnit.exponent - baseUnit.exponent;
  if (exp <= 0) return `${formatIntWithSep(amount)} ${displayName}`;
  const factor = BigInt(10 ** exp);
  const big = BigInt(amount);
  const whole = big / factor;
  const rem = big % factor;
  if (rem === BigInt(0)) return `${formatIntWithSep(whole.toString())} ${displayName}`;
  const decimals = rem.toString().padStart(exp, "0").replace(/0+$/, "");
  return `${formatIntWithSep(whole.toString())}.${decimals} ${displayName}`;
}

async function formatCoins(
  coins: Array<{ denom: string; amount: string }>,
  restUrl: string,
): Promise<string> {
  if (coins.length === 0) return "0";
  const parts = await Promise.all(
    coins.map(async (c) => {
      const meta = await queryCoinMetadata(restUrl, c.denom);
      return formatOneCoin(c.amount, c.denom, meta);
    }),
  );
  return parts.join(", ");
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatPubkeyHex(pubkey: Uint8Array): string {
  const hex = Buffer.from(pubkey).toString("hex").toUpperCase();
  const groups: string[] = [];
  for (let i = 0; i < hex.length; i += 4) groups.push(hex.slice(i, i + 4));
  return groups.join(" ");
}

function formatGasLimit(gas: bigint | number | string): string {
  return BigInt(gas).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

function computeRawBytesHash(bodyBytes: Uint8Array, authInfoBytes: Uint8Array): string {
  const buf = new Uint8Array(8 + bodyBytes.length + 8 + authInfoBytes.length);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, BigInt(bodyBytes.length), false);
  buf.set(bodyBytes, 8);
  view.setBigUint64(8 + bodyBytes.length, BigInt(authInfoBytes.length), false);
  buf.set(authInfoBytes, 8 + bodyBytes.length + 8);
  return Buffer.from(sha256(buf)).toString("hex");
}

// proto snake_case or camelCase → "Sentence case"
function fieldToDisplayName(name: string): string {
  const snake = name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  return snake.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// Returns true if v is a plain proto message object (not Duration, Coin, Any, array, or primitive)
function isPlainProtoMessage(v: unknown): boolean {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  if ("seconds" in v) return false;                      // Duration / Timestamp
  if ("denom" in v && "amount" in v) return false;       // Coin
  if ("typeUrl" in v) return false;                      // Any
  return true;
}

const VOTE_OPTION_NAMES: Record<number, string> = {
  0: "VOTE_OPTION_UNSPECIFIED",
  1: "VOTE_OPTION_YES",
  2: "VOTE_OPTION_ABSTAIN",
  3: "VOTE_OPTION_NO",
  4: "VOTE_OPTION_NO_WITH_VETO",
};

// Cosmos textual renders enum values as their symbolic name (via fd.Enum()), not
// as the numeric wire value. Decoded proto objects give us only the number, so
// we map it back to the canonical name here. Without this, authz stake grants
// rendered the authorizationType as "1" instead of "AUTHORIZATION_TYPE_DELEGATE"
// and failed TEXTUAL signature verification.
const STAKE_AUTHORIZATION_TYPE_NAMES: Record<number, string> = {
  0: "AUTHORIZATION_TYPE_UNSPECIFIED",
  1: "AUTHORIZATION_TYPE_DELEGATE",
  2: "AUTHORIZATION_TYPE_UNDELEGATE",
  3: "AUTHORIZATION_TYPE_REDELEGATE",
  4: "AUTHORIZATION_TYPE_CANCEL_UNBONDING_DELEGATION",
};

function isLongObject(v: unknown): v is { low: number; high: number; unsigned: boolean; toString(): string } {
  return typeof v === "object" && v !== null && "low" in v && "high" in v && typeof (v as { toString: unknown }).toString === "function";
}

// Converts Uint8Array or a JSON-serialized numeric-keyed object back to Uint8Array
function toUint8ArraySafe(v: unknown): Uint8Array | null {
  if (v instanceof Uint8Array) return v;
  if (Buffer.isBuffer(v)) return new Uint8Array(v);
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)) && typeof obj[k] === "number")) {
      const arr = new Uint8Array(keys.length);
      for (const k of keys) arr[Number(k)] = obj[k] as number;
      return arr;
    }
  }
  return null;
}

// Converts proto Duration { seconds: bigint, nanos: number } to amino nanoseconds string
function durationToAminoNanos(d: { seconds: bigint | string | number; nanos?: number }): string {
  return (BigInt(d.seconds.toString()) * BigInt(1_000_000_000) + BigInt(d.nanos ?? 0)).toString();
}

// Renders proto Duration as human-readable string (matches Cosmos SDK textual renderer).
// NOTE: parts are joined with ", " (comma + space), not just space. Cosmos SDK's
// duration renderer uses comma-separated components; an earlier version of this
// function joined with " " which produced "5 minutes 1 second" instead of the
// chain's "5 minutes, 1 second" and broke TEXTUAL signature verification for any
// message containing a non-trivial Duration (gov Params Update was the trigger).
function renderDuration(d: { seconds: bigint | string | number; nanos?: number }): string {
  let totalSeconds = BigInt(d.seconds.toString());
  const days = totalSeconds / BigInt(86400);
  totalSeconds -= days * BigInt(86400);
  const hours = totalSeconds / BigInt(3600);
  totalSeconds -= hours * BigInt(3600);
  const minutes = totalSeconds / BigInt(60);
  const seconds = totalSeconds - minutes * BigInt(60);
  const parts: string[] = [];
  if (days > BigInt(0)) parts.push(`${days} day${days === BigInt(1) ? "" : "s"}`);
  if (hours > BigInt(0)) parts.push(`${hours} hour${hours === BigInt(1) ? "" : "s"}`);
  if (minutes > BigInt(0)) parts.push(`${minutes} minute${minutes === BigInt(1) ? "" : "s"}`);
  if (seconds > BigInt(0)) parts.push(`${seconds} second${seconds === BigInt(1) ? "" : "s"}`);
  return parts.length > 0 ? parts.join(", ") : "0 seconds";
}

// Renders proto Timestamp as RFC3339Nano (matches Cosmos SDK textual renderer
// time.Format(time.RFC3339Nano) — trailing zeros of subsecond precision trimmed).
// Added because google.protobuf.Timestamp and google.protobuf.Duration share the
// {seconds, nanos} shape, and the renderer previously treated every such object
// as a Duration. That produced e.g. "20930 days, 11 hours, 10 minutes, 25 seconds"
// for an authz.Grant.expiration Timestamp, while the chain reconstructed the
// equivalent RFC3339 string ("2027-04-22T11:10:25Z") — CBOR bytes diverged and
// signature verification failed with `code 4 unauthorized`.
function renderTimestamp(t: { seconds: bigint | string | number; nanos?: number }): string {
  const secs = BigInt(t.seconds.toString());
  const nanos = t.nanos ?? 0;
  const ms = Number(secs) * 1000;
  const iso = new Date(ms).toISOString();
  if (nanos === 0) {
    return iso.replace(/\.\d+Z$/, "Z");
  }
  const nanoStr = String(nanos).padStart(9, "0").replace(/0+$/, "");
  return iso.replace(/\.\d+Z$/, `.${nanoStr}Z`);
}

// Proto fields that carry google.protobuf.Timestamp (not Duration). Both have
// the same {seconds, nanos} shape, so field name is the only disambiguator
// unless we thread proto type info through the renderer.
const TIMESTAMP_FIELD_NAMES = new Set([
  "expiration", "expirationTime", "expiration_time",
  "time",
]);

// cosmos.Dec may reach us as either form:
//   (a) raw 18-decimal fixed-point integer string ("334000000000000000")
//   (b) already-formatted decimal string ("0.334000000000000000") — this is what
//       Cosmos SDK's Dec.String() produces and what REST/LCD returns.
// Both must render to the Cosmos textual form: integer part with ' thousand
// separators, trailing fractional zeros stripped (e.g. "1'234.56", "0.334").
//
// The earlier implementation assumed (a) only. Given input "0.334000000000000000"
// it produced "0..334" (the leading "0." was treated as the integer slice and a
// second "." was injected as the decimal separator), breaking TEXTUAL signature
// verification for gov.Params (quorum/threshold/etc.) update proposals submitted
// from firma-station where the params come through pre-formatted from the chain.
function renderCosmosDecString(s: string): string {
  const neg = s.startsWith("-");
  const raw = neg ? s.slice(1) : s;

  let intPart: string;
  let fracPart: string;

  if (raw.includes(".")) {
    const [intPartRaw, fracPartRaw = ""] = raw.split(".");
    intPart = intPartRaw.replace(/^0+/, "") || "0";
    fracPart = fracPartRaw.replace(/0+$/, "");
  } else {
    const DEC_PRECISION = 18;
    const padded = raw.padStart(DEC_PRECISION + 1, "0");
    intPart = (padded.slice(0, padded.length - DEC_PRECISION).replace(/^0+/, "") || "0");
    fracPart = padded.slice(padded.length - DEC_PRECISION).replace(/0+$/, "");
  }

  const intFormatted = formatIntWithSep(intPart);
  return (neg ? "-" : "") + (fracPart ? `${intFormatted}.${fracPart}` : intFormatted);
}

// Fields known to carry cosmos.Dec values (18-decimal fixed-point strings)
const COSMOS_DEC_FIELDS = new Set([
  "minCommissionRate", "min_commission_rate",
  "quorum", "threshold", "vetoThreshold", "veto_threshold",
  "minInitialDepositRatio", "min_initial_deposit_ratio",
  "proposalCancelRatio", "proposal_cancel_ratio",
  "expeditedThreshold", "expedited_threshold",
  "minDepositRatio", "min_deposit_ratio",
]);

// Minimal structural contract for proto message classes used as Any decoders.
// The real proto classes have a richer `.decode(reader, length?)` signature, but
// we only need to feed them raw bytes and receive back a keyed object.
interface NestedDecoder {
  decode(b: Uint8Array): unknown;
}

// Fallback decoders for Any-wrapped messages that the per-tx Registry may not
// know about. TEXTUAL rendering must descend into the inner message and emit
// each sub-field as its own screen; without a decoder here we would render only
// the Any typeUrl and omit every sub-field — which leaves our CBOR shorter than
// the chain's reconstruction and causes `code 4 unauthorized`. The Authorization
// entries were added specifically for authz Grant flows (stake delegate grant).
const NESTED_ANY_DECODERS: Map<string, NestedDecoder> = new Map([
  ["/cosmos.distribution.v1beta1.MsgCommunityPoolSpend", MsgCommunityPoolSpend],
  ["/cosmos.staking.v1beta1.MsgUpdateParams", StakingMsgUpdateParams],
  ["/cosmos.staking.v1beta1.StakeAuthorization", StakeAuthorization],
  ["/cosmos.bank.v1beta1.SendAuthorization", SendAuthorization],
  ["/cosmos.authz.v1beta1.GenericAuthorization", GenericAuthorization],
  ["/cosmos.gov.v1.MsgUpdateParams", GovMsgUpdateParams],
  ["/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade", MsgSoftwareUpgrade],
]);

function lookupNestedDecoder(
  typeUrl: string,
  registry: Registry,
): NestedDecoder | null {
  try {
    const t = registry.lookupType(typeUrl);
    if (t) return t as NestedDecoder;
  } catch {}
  return NESTED_ANY_DECODERS.get(typeUrl) ?? null;
}

function isSingleAnyObject(v: unknown): v is { typeUrl: string; value: unknown } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    "typeUrl" in v &&
    "value" in v &&
    typeof (v as { typeUrl: unknown }).typeUrl === "string"
  );
}

// Cosmos textual Any renderer: replace "{Type} object" header with the typeUrl
// content, then recursively render the inner message's fields at indent+1.
//
// Added because previously `renderFieldValue` for an Any object returned only
// the typeUrl as a single string and never descended into sub-fields. This was
// fine for repeated-Any fields (MsgSubmitProposal.messages handled separately),
// but broke on single-Any fields such as authz.Grant.authorization. The chain's
// textual renderer always expands the Any body, so dropping the sub-fields on
// the wallet side left the CBOR short and signatures unverifiable.
async function renderSingleAnyField(
  fieldName: string,
  any: { typeUrl: string; value: unknown },
  baseIndent: number,
  registry: Registry,
  restUrl: string,
  screens: TextualScreen[],
): Promise<void> {
  screens.push({ title: fieldToDisplayName(fieldName), content: any.typeUrl, indent: baseIndent });
  const decoder = lookupNestedDecoder(any.typeUrl, registry);
  const valueBytes = toUint8ArraySafe(any.value);
  if (!decoder || !valueBytes) {
    if (!decoder) console.warn('[Textual] no decoder for nested Any:', any.typeUrl);
    return;
  }
  try {
    const nested = decoder.decode(valueBytes) as Record<string, unknown>;
    await renderMessageFields(nested, baseIndent + 1, registry, restUrl, screens, any.typeUrl);
  } catch (e) {
    console.warn('[Textual] nested Any decode error for', any.typeUrl, ':', e);
  }
}

// Scalar kind label for Cosmos textual formatRepeated.
// Matches Go's toSentenceCase(fd.Kind().String()) — first letter capitalized,
// NO pluralization regardless of count (e.g. "3 String", "1 Any", "2 Int64").
function getScalarKindLabel(item: unknown): string {
  if (typeof item === "string") return "String";
  if (typeof item === "boolean") return "Bool";
  if (typeof item === "number" || typeof item === "bigint") return "Int64";
  if (isLongObject(item)) return "Int64";
  if (item instanceof Uint8Array) return "Bytes";
  return "Item";
}

// Renders a repeated scalar/primitive field (repeated string, int, bool, etc.)
// as cosmos textual formatRepeated output:
//   "{Title}: {N} {Kind}"        (kind is capitalized singular, no plural)
//   "{Title} (1/N): {value}"
//   ...
//   "End of {Title}"
//
// Added for authz StakeAuthorization.Validators.address (repeated string). The
// old fallback in renderFieldValue JSON-stringified the array to a single line
// ('["firmavaloper1...", ...]'), which the chain's textual renderer does NOT
// produce — it emits the count header + per-item screens + terminal. Mismatch
// → signature verification failed.
async function renderRepeatedScalar(
  fieldName: string,
  items: unknown[],
  baseIndent: number,
  restUrl: string,
  screens: TextualScreen[],
  parentTypeUrl?: string,
): Promise<void> {
  const count = items.length;
  const kind = getScalarKindLabel(items[0]);
  const title = fieldToDisplayName(fieldName);
  screens.push({ title, content: `${count} ${kind}`, indent: baseIndent });
  for (let i = 0; i < count; i++) {
    const itemTitle = `${title} (${i + 1}/${count})`;
    const content = await renderFieldValue(items[i], restUrl, fieldName, parentTypeUrl);
    screens.push({ title: itemTitle, content, indent: baseIndent + 1 });
  }
  screens.push({ content: `End of ${title}`, indent: baseIndent });
}

// True for arrays that should render as formatRepeated multi-screen (not a single
// comma-joined line like Coin arrays). Applies to primitives and plain messages.
function isMultiScreenRepeated(v: unknown[]): boolean {
  if (v.length === 0) return false;
  const first = v[0];
  if (typeof first === "string") return true;
  if (typeof first === "boolean") return true;
  if (typeof first === "number" || typeof first === "bigint") return true;
  if (isLongObject(first)) return true;
  return false;
}

// Mirrors proto3 "default value skipping" — the chain's textual renderer
// omits fields that are at their proto3 default (proto3 doesn't write defaults
// to the wire, so the chain's Message.Has(fd) returns false for them). If the
// wallet renders them anyway, our CBOR gains extra screens the chain never
// produces and signature verification fails. The Any/Timestamp/Uint8Array
// entries below were added incrementally as failure modes surfaced (most
// notably Plan.upgraded_client_state, an empty Any that blocked Software
// Upgrade proposals).
function shouldSkipField(v: unknown): boolean {
  if (v === "" || v === false) return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (v === 0 || v === BigInt(0)) return true;
  if (v === null || v === undefined) return true;
  if (isLongObject(v) && v.low === 0 && v.high === 0) return true;
  if (v instanceof Uint8Array && v.length === 0) return true;
  if (typeof v === "object" && v !== null && "seconds" in v && !Array.isArray(v)) {
    const dur = v as { seconds: bigint | string | number; nanos?: number };
    if (BigInt(dur.seconds.toString()) === BigInt(0) && (dur.nanos ?? 0) === 0) return true;
  }
  if (typeof v === "object" && v !== null && "typeUrl" in v && !Array.isArray(v)) {
    const any = v as { typeUrl: string };
    if (any.typeUrl === "") return true;
  }
  return false;
}

// Cosmos textual "{TypeName} object" header uses the proto MESSAGE TYPE name,
// not the field name. Most of our fields coincidentally match (params→Params,
// plan→Plan, grant→Grant), but some don't (allow_list→Validators). Hardcode
// the known overrides; fallback to field-derived display name otherwise.
//
// Without this override, StakeAuthorization.allow_list rendered as "Allow list
// object" while the chain produced "Validators object", and every stake-grant
// tx failed TEXTUAL signature verification. Extend this map when a new
// field→type name divergence is discovered in a failing tx.
function getNestedMessageTypeName(fieldName: string, parentTypeUrl?: string): string {
  if (parentTypeUrl === "/cosmos.staking.v1beta1.StakeAuthorization") {
    if (fieldName === "allowList" || fieldName === "denyList") return "Validators";
  }
  return fieldToDisplayName(fieldName);
}

// Renders a nested proto message object as title+content header followed by sub-fields.
// Mirrors Cosmos SDK MessageValueRenderer: "{TypeName} object" header + sub-fields at indent+1.
async function renderNestedProtoMessage(
  obj: Record<string, unknown>,
  fieldName: string,
  baseIndent: number,
  restUrl: string,
  screens: TextualScreen[],
  registry: Registry,
  parentTypeUrl?: string,
): Promise<void> {
  const displayName = fieldToDisplayName(fieldName);
  const typeName = getNestedMessageTypeName(fieldName, parentTypeUrl);
  screens.push({ title: displayName, content: `${typeName} object`, indent: baseIndent });
  await renderMessageFields(obj, baseIndent + 1, registry, restUrl, screens, parentTypeUrl);
}

// Dispatches a single field to the appropriate renderer (Any / repeated scalar /
// nested message / scalar fallback). Extracted from the three duplicated loops
// in renderSingleAnyField, renderNestedProtoMessage, and buildTextualScreens.
async function renderSingleField(
  fieldName: string,
  value: unknown,
  baseIndent: number,
  registry: Registry,
  restUrl: string,
  screens: TextualScreen[],
  parentTypeUrl?: string,
): Promise<void> {
  if (isSingleAnyObject(value)) {
    await renderSingleAnyField(fieldName, value, baseIndent, registry, restUrl, screens);
    return;
  }
  if (Array.isArray(value) && isMultiScreenRepeated(value)) {
    await renderRepeatedScalar(fieldName, value, baseIndent, restUrl, screens, parentTypeUrl);
    return;
  }
  if (isPlainProtoMessage(value)) {
    await renderNestedProtoMessage(value as Record<string, unknown>, fieldName, baseIndent, restUrl, screens, registry, parentTypeUrl);
    return;
  }
  let content: string;
  try {
    content = await renderFieldValue(value, restUrl, fieldName, parentTypeUrl);
  } catch (e) {
    console.warn('[Textual] renderFieldValue error for field', fieldName, ':', e);
    content = "(error)";
  }
  screens.push({ title: fieldToDisplayName(fieldName), content, indent: baseIndent });
}

// Iterates a proto message's fields, skipping proto3-default values and
// dispatching the rest through renderSingleField.
async function renderMessageFields(
  fields: Record<string, unknown>,
  baseIndent: number,
  registry: Registry,
  restUrl: string,
  screens: TextualScreen[],
  parentTypeUrl?: string,
): Promise<void> {
  for (const [k, v] of Object.entries(fields)) {
    if (shouldSkipField(v)) continue;
    await renderSingleField(k, v, baseIndent, registry, restUrl, screens, parentTypeUrl);
  }
}

async function renderFieldValue(
  value: unknown,
  restUrl: string,
  fieldName?: string,
  typeUrl?: string,
): Promise<string> {
  if (typeof value === "string") {
    if (fieldName && COSMOS_DEC_FIELDS.has(fieldName)) return renderCosmosDecString(value);
    return value;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    // VoteOption enum → string name
    if (typeUrl === "/cosmos.gov.v1.MsgVote" && fieldName === "option" && typeof value === "number") {
      return VOTE_OPTION_NAMES[value] ?? String(value);
    }
    // StakeAuthorization.AuthorizationType enum → string name
    if (typeUrl === "/cosmos.staking.v1beta1.StakeAuthorization" && fieldName === "authorizationType" && typeof value === "number") {
      return STAKE_AUTHORIZATION_TYPE_NAMES[value] ?? String(value);
    }
    return formatIntWithSep(value.toString());
  }
  // Long.js object (protobufjs uint64/int64) → decimal string with apostrophe separators
  if (isLongObject(value)) return formatIntWithSep(value.toString());
  if (typeof value === "boolean") return value ? "True" : "False";
  if (value instanceof Uint8Array) return `(${value.length} bytes)`;
  if (Array.isArray(value)) {
    if (value.length === 0) return "(none)";
    if (
      typeof value[0] === "object" &&
      value[0] !== null &&
      "denom" in value[0] &&
      "amount" in value[0]
    ) {
      return formatCoins(value as Array<{ denom: string; amount: string }>, restUrl);
    }
    // Any[] — show typeUrls only to avoid Uint8Array serialization
    if (typeof value[0] === "object" && value[0] !== null && "typeUrl" in value[0]) {
      return (value as Array<{ typeUrl: string }>).map((a) => a.typeUrl).join(", ");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "object" && value !== null) {
    // proto Duration / Timestamp { seconds, nanos } — identical shape, disambiguated by field name
    if ("seconds" in value) {
      const tv = value as { seconds: bigint | string | number; nanos?: number };
      if (fieldName && TIMESTAMP_FIELD_NAMES.has(fieldName)) {
        return renderTimestamp(tv);
      }
      return renderDuration(tv);
    }
    if ("denom" in value && "amount" in value) {
      const coin = value as { denom: string; amount: string };
      const meta = await queryCoinMetadata(restUrl, coin.denom);
      return formatOneCoin(coin.amount, coin.denom, meta);
    }
    // Any object — show typeUrl only
    if ("typeUrl" in value) return (value as { typeUrl: string }).typeUrl;
    return JSON.stringify(value);
  }
  return String(value ?? "");
}

// ─── Amino signing (SIGN_MODE_LEGACY_AMINO_JSON) ──────────────────────────────

export async function signWithSignerAmino(
  signer: LedgerWalletInterface,
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  registry: Registry,
): Promise<TxRaw> {
  const pubkey = await signer.getPublicKey();
  const pubkeyProto: Any = {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: Secp256k1PubKey.encode({ key: pubkey }).finish(),
  };
  const aminoTypes = buildAminoTypesForCheck();
  const aminoMsgs = messages.map((msg) => aminoTypes.toAmino(msg));
  const stdFee: StdFee = {
    amount: option.fee.amount.map((c) => ({ denom: c.denom, amount: c.amount })),
    gas: option.fee.gasLimit.toString(),
    granter: option.fee.granter || undefined,
    payer: option.fee.payer || undefined,
  };
  const signDoc = makeSignDoc(
    aminoMsgs, stdFee, signerData.chain_id, option.memo || "",
    signerData.account_number, signerData.sequence,
  );
  const signStr = Buffer.from(serializeSignDoc(signDoc)).toString("utf8");
  const signature = await signer.sign(signStr, 0x00);
  if (!signature || signature.length === 0)
    throw new Error("Signature is empty. Please confirm the transaction on your Ledger device.");
  if (signature.length !== 64)
    throw new Error(`Unexpected signature length: ${signature.length} bytes (expected 64)`);
  const anyMsgs = messages.map((msg) => registry.encodeAsAny(msg));
  const bodyBytes = TxBody.encode(TxBody.fromPartial({ messages: anyMsgs, memo: option.memo || "" })).finish();
  const feeCoins: Coin[] = option.fee.amount.map((a) => ({ denom: a.denom, amount: a.amount }));
  const authInfoBytes = makeAuthInfoBytes(
    [{ pubkey: pubkeyProto, sequence: signerData.sequence }],
    feeCoins,
    option.fee.gasLimit,
    option.fee.granter || undefined,
    option.fee.payer || undefined,
    SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
  );
  return TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [signature] });
}

// ─── Textual signing (SIGN_MODE_TEXTUAL, P2=0x01) ─────────────────────────────

async function buildTextualScreens(
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  pubkey: Uint8Array,
  address: string,
  bodyBytes: Uint8Array,
  authInfoBytes: Uint8Array,
  restApiAddress: string,
  registry: Registry,
): Promise<TextualScreen[]> {
  const screens: TextualScreen[] = [];

  screens.push({ title: "Chain id", content: signerData.chain_id });
  screens.push({ title: "Account number", content: signerData.account_number.toString() });
  screens.push({ title: "Sequence", content: signerData.sequence.toString() });
  screens.push({ title: "Address", content: address, expert: true });
  screens.push({ title: "Public key", content: "/cosmos.crypto.secp256k1.PubKey", expert: true });
  screens.push({ title: "Key", content: formatPubkeyHex(pubkey), indent: 1, expert: true });

  const count = messages.length;
  screens.push({ content: `This transaction has ${count} Message${count === 1 ? "" : "s"}` });

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    screens.push({ title: `Message (${i + 1}/${count})`, content: msg.typeUrl, indent: 1 });
    // Any renderer replaces the "{Type} object" header with the typeUrl — no "object" screen here.

    let fields: Record<string, unknown> = {};
    const MsgType = registry.lookupType(msg.typeUrl);
    if (MsgType) {
      try {
        const encodedBytes = registry.encodeAsAny(msg).value;
        fields = (MsgType.decode(encodedBytes) as unknown) as Record<string, unknown>;
      } catch {
        if (msg.value && typeof msg.value === "object") {
          fields = msg.value as Record<string, unknown>;
        }
      }
    } else if (msg.value && typeof msg.value === "object") {
      fields = msg.value as Record<string, unknown>;
    }
    if (DEBUG_LEDGER) console.log('[Textual] typeUrl:', msg.typeUrl, 'fields keys:', Object.keys(fields));
    for (const [k, v] of Object.entries(fields)) {
      if (shouldSkipField(v)) continue;

      // Repeated Any[] field (e.g. MsgSubmitProposal.messages)
      if (
        Array.isArray(v) &&
        v.length > 0 &&
        typeof v[0] === "object" &&
        v[0] !== null &&
        "typeUrl" in v[0] &&
        "value" in v[0] &&
        toUint8ArraySafe((v[0] as { value: unknown }).value) !== null
      ) {
        const anyArray = v as Array<{ typeUrl: string; value: unknown }>;
        const anyCount = anyArray.length;
        const fieldTitle = fieldToDisplayName(k);
        // Header: "N Any" matches SDK's formatRepeated count screen (getKind = "Any" for google.protobuf.Any)
        screens.push({ title: fieldTitle, content: `${anyCount} Any`, indent: 2 });
        for (let j = 0; j < anyArray.length; j++) {
          const anyItem = anyArray[j];
          // Any renderer replaces "{Type} object" header with typeUrl — use typeUrl as content
          screens.push({ title: `${fieldTitle} (${j + 1}/${anyCount})`, content: anyItem.typeUrl, indent: 3 });
          const decoder = lookupNestedDecoder(anyItem.typeUrl, registry);
          const valueBytes = toUint8ArraySafe(anyItem.value);
          if (decoder && valueBytes) {
            try {
              const nested = decoder.decode(valueBytes) as Record<string, unknown>;
              await renderMessageFields(nested, 4, registry, restApiAddress, screens, anyItem.typeUrl);
            } catch (e) {
              console.warn('[Textual] nested Any decode error for', anyItem.typeUrl, ':', e);
            }
          } else {
            console.warn('[Textual] no decoder for nested Any:', anyItem.typeUrl);
          }
        }
        // Terminal screen for repeated Any field (mirrors SDK formatRepeated terminalScreen)
        screens.push({ content: `End of ${fieldTitle}`, indent: 2 });
        continue;
      }

      // Non-Any[] fields: dispatch through the shared single-field renderer
      await renderSingleField(k, v, 2, registry, restApiAddress, screens, msg.typeUrl);
    }
  }
  // One "End of Message" terminal after all messages (SDK formatRepeated terminal for Envelope.message field)
  screens.push({ content: "End of Message" });

  const feeCoins = option.fee.amount.map((c) => ({ denom: c.denom, amount: c.amount }));
  screens.push({ title: "Fees", content: await formatCoins(feeCoins, restApiAddress) });
  screens.push({ title: "Gas limit", content: formatGasLimit(option.fee.gasLimit), expert: true });
  screens.push({
    title: "Hash of raw bytes",
    content: computeRawBytesHash(bodyBytes, authInfoBytes),
    expert: true,
  });

  return screens;
}

// ─── Auto sign mode routing ───────────────────────────────────────────────────

function buildAminoTypesForCheck(): AminoTypes {
  const baseConverters = {
    ...createBankAminoConverters(),
    ...createStakingAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createAuthzAminoConverters(),
    ...createVestingAminoConverters(),
  };

  // Custom converters for nested governance action messages absent from @cosmjs/stargate 0.34.x
  const nestedMsgConverters: Record<string, any> = {
    "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend": {
      aminoType: "cosmos-sdk/distr/MsgCommunityPoolSpend",
      toAmino: (value: any) => ({
        authority: value.authority,
        recipient: value.recipient,
        amount: value.amount,
      }),
      fromAmino: (value: any) => ({
        authority: value.authority,
        recipient: value.recipient,
        amount: value.amount,
      }),
    },
    "/cosmos.staking.v1beta1.MsgUpdateParams": {
      aminoType: "cosmos-sdk/x/staking/MsgUpdateParams",
      toAmino: (value: any) => {
        const p = value.params ?? {};
        return {
          authority: value.authority,
          params: {
            unbonding_time: p.unbondingTime ? durationToAminoNanos(p.unbondingTime) : "0",
            max_validators: p.maxValidators,
            max_entries: p.maxEntries,
            historical_entries: p.historicalEntries,
            bond_denom: p.bondDenom,
            min_commission_rate: p.minCommissionRate ?? "0",
          },
        };
      },
      fromAmino: (value: any) => value,
    },
    "/cosmos.gov.v1.MsgUpdateParams": {
      aminoType: "cosmos-sdk/x/gov/v1/MsgUpdateParams",
      toAmino: (value: any) => {
        const p = value.params ?? {};
        const result: any = {
          authority: value.authority,
          params: {
            ...(p.minDeposit?.length ? { min_deposit: p.minDeposit } : {}),
            ...(p.maxDepositPeriod ? { max_deposit_period: durationToAminoNanos(p.maxDepositPeriod) } : {}),
            ...(p.votingPeriod ? { voting_period: durationToAminoNanos(p.votingPeriod) } : {}),
            ...(p.quorum ? { quorum: p.quorum } : {}),
            ...(p.threshold ? { threshold: p.threshold } : {}),
            ...(p.vetoThreshold ? { veto_threshold: p.vetoThreshold } : {}),
            ...(p.minInitialDepositRatio ? { min_initial_deposit_ratio: p.minInitialDepositRatio } : {}),
            ...(p.proposalCancelRatio ? { proposal_cancel_ratio: p.proposalCancelRatio } : {}),
            ...(p.proposalCancelDest ? { proposal_cancel_dest: p.proposalCancelDest } : {}),
            ...(p.expeditedVotingPeriod ? { expedited_voting_period: durationToAminoNanos(p.expeditedVotingPeriod) } : {}),
            ...(p.expeditedThreshold ? { expedited_threshold: p.expeditedThreshold } : {}),
            ...(p.expeditedMinDeposit?.length ? { expedited_min_deposit: p.expeditedMinDeposit } : {}),
            burn_vote_quorum: p.burnVoteQuorum ?? false,
            burn_proposal_deposit_prevote: p.burnProposalDepositPrevote ?? false,
            burn_vote_veto: p.burnVoteVeto ?? false,
            ...(p.minDepositRatio ? { min_deposit_ratio: p.minDepositRatio } : {}),
          },
        };
        return result;
      },
      fromAmino: (value: any) => value,
    },
    "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade": {
      aminoType: "cosmos-sdk/MsgSoftwareUpgrade",
      toAmino: (value: any) => {
        const plan = value.plan ?? {};
        return {
          authority: value.authority,
          plan: {
            name: plan.name,
            height: plan.height?.toString() ?? "0",
            info: plan.info ?? "",
          },
        };
      },
      fromAmino: (value: any) => value,
    },
  };

  // Build base amino types (with nested msg converters) for use inside the MsgSubmitProposal toAmino
  const baseAminoTypes = new AminoTypes({ ...baseConverters, ...nestedMsgConverters });

  // All cosmos.gov.v1 messages are absent from @cosmjs/stargate 0.34.x createGovAminoConverters
  // (only v1beta1 is present).  Without these converters signWithSignerAuto falls back to
  // SIGN_MODE_TEXTUAL, which the chain cannot verify.
  const govV1Converters: Record<string, any> = {
    "/cosmos.gov.v1.MsgSubmitProposal": {
      aminoType: "cosmos-sdk/v1/MsgSubmitProposal",
      toAmino: (value: any) => {
        const aminoMessages: any[] = [];
        for (const anyMsg of (value.messages || [])) {
          const valueBytes = toUint8ArraySafe(anyMsg.value);
          const decoder = NESTED_ANY_DECODERS.get(anyMsg.typeUrl);
          if (decoder && valueBytes) {
            const decoded = decoder.decode(valueBytes);
            aminoMessages.push(baseAminoTypes.toAmino({ typeUrl: anyMsg.typeUrl, value: decoded }));
          } else {
            try {
              aminoMessages.push(baseAminoTypes.toAmino(anyMsg));
            } catch {
              throw new Error(`Cannot amino-convert nested message: ${anyMsg.typeUrl}`);
            }
          }
        }
        const result: any = {
          proposer: value.proposer,
          title: value.title || "",
          summary: value.summary || "",
        };
        if (aminoMessages.length > 0) result.messages = aminoMessages;
        if (value.initialDeposit && value.initialDeposit.length > 0) result.initial_deposit = value.initialDeposit;
        if (value.metadata) result.metadata = value.metadata;
        if (value.expedited) result.expedited = value.expedited;
        return result;
      },
      fromAmino: (value: any) => ({
        messages: value.messages ?? [],
        initialDeposit: value.initial_deposit ?? [],
        proposer: value.proposer,
        title: value.title,
        summary: value.summary,
        metadata: value.metadata ?? "",
        expedited: value.expedited ?? false,
      }),
    },
    "/cosmos.gov.v1.MsgVote": {
      aminoType: "cosmos-sdk/v1/MsgVote",
      toAmino: (value: any) => {
        const result: any = {
          proposal_id: value.proposalId.toString(),
          voter: value.voter,
          option: value.option,
        };
        if (value.metadata) result.metadata = value.metadata;
        return result;
      },
      fromAmino: (value: any) => ({
        proposalId: BigInt(value.proposal_id),
        voter: value.voter,
        option: value.option,
        metadata: value.metadata ?? "",
      }),
    },
    "/cosmos.gov.v1.MsgVoteWeighted": {
      aminoType: "cosmos-sdk/v1/MsgVoteWeighted",
      toAmino: (value: any) => {
        const result: any = {
          proposal_id: value.proposalId.toString(),
          voter: value.voter,
          options: value.options,
        };
        if (value.metadata) result.metadata = value.metadata;
        return result;
      },
      fromAmino: (value: any) => ({
        proposalId: BigInt(value.proposal_id),
        voter: value.voter,
        options: value.options,
        metadata: value.metadata ?? "",
      }),
    },
    "/cosmos.gov.v1.MsgDeposit": {
      aminoType: "cosmos-sdk/v1/MsgDeposit",
      toAmino: (value: any) => ({
        proposal_id: value.proposalId.toString(),
        depositor: value.depositor,
        amount: value.amount,
      }),
      fromAmino: (value: any) => ({
        proposalId: BigInt(value.proposal_id),
        depositor: value.depositor,
        amount: value.amount,
      }),
    },
    "/cosmos.gov.v1.MsgCancelProposal": {
      aminoType: "cosmos-sdk/v1/MsgCancelProposal",
      toAmino: (value: any) => ({
        proposal_id: value.proposalId.toString(),
        proposer: value.proposer,
      }),
      fromAmino: (value: any) => ({
        proposalId: BigInt(value.proposal_id),
        proposer: value.proposer,
      }),
    },
  };

  return new AminoTypes({ ...baseConverters, ...nestedMsgConverters, ...govV1Converters });
}


export async function signWithSignerAuto(
  signer: LedgerWalletInterface,
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  registry: Registry,
  restApiAddress = "",
): Promise<TxRaw> {
  if (DEBUG_LEDGER) {
    const typeUrls = messages.map((m) => m.typeUrl).join(', ');
    console.log(`[Ledger] sign mode: TEXTUAL | msgs: ${typeUrls}`);
  }
  return signWithSignerTextual(signer, messages, signerData, option, registry, restApiAddress);
}

export async function signWithSignerTextual(
  signer: LedgerWalletInterface,
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  registry: Registry,
  restApiAddress = "",
): Promise<TxRaw> {
  const { address, publicKey: pubkey } = await signer.getAddressAndPublicKey();

  const pubkeyProto: Any = {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: Secp256k1PubKey.encode({ key: pubkey }).finish(),
  };

  const anyMsgs = messages.map((msg) => registry.encodeAsAny(msg));
  const bodyBytes = TxBody.encode(
    TxBody.fromPartial({ messages: anyMsgs, memo: option.memo || "" }),
  ).finish();

  const feeCoins: Coin[] = option.fee.amount.map((a) => ({ denom: a.denom, amount: a.amount }));
  const authInfoBytes = makeAuthInfoBytes(
    [{ pubkey: pubkeyProto, sequence: signerData.sequence }],
    feeCoins,
    option.fee.gasLimit,
    option.fee.granter || undefined,
    option.fee.payer || undefined,
    SignMode.SIGN_MODE_TEXTUAL,
  );

  const screens = await buildTextualScreens(
    messages, signerData, option,
    pubkey, address, bodyBytes, authInfoBytes, restApiAddress, registry,
  );

  if (DEBUG_LEDGER_CBOR) {
    console.log('[Textual] === SCREENS DUMP ===');
    screens.forEach((s, i) => {
      const parts = [`[${i}]`];
      if (s.title) parts.push(`title="${s.title}"`);
      parts.push(`content="${s.content}"`);
      if (s.indent) parts.push(`indent=${s.indent}`);
      if (s.expert) parts.push(`expert=true`);
      console.log('[Textual]', parts.join(' '));
    });
  }

  const cborBuffer = encodeTextualCbor(screens);
  if (DEBUG_LEDGER_CBOR) {
    console.log('[Textual] CBOR hex:', Array.from(cborBuffer).map(b => b.toString(16).padStart(2, '0')).join(''));
  }

  const signature = await signer.sign(cborBuffer, 0x01);
  if (!signature || signature.length === 0)
    throw new Error("Signature is empty. Please confirm the transaction on your Ledger device.");
  if (signature.length !== 64)
    throw new Error(`Unexpected signature length: ${signature.length} bytes (expected 64)`);

  return TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [signature] });
}
