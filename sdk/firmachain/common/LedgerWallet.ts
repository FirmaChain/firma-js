import { EncodeObject, Registry } from "@cosmjs/proto-signing";
import { sha256 } from "@cosmjs/crypto";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { PubKey as Secp256k1PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
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

async function renderFieldValue(
  value: unknown,
  restUrl: string,
): Promise<string> {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0] !== null &&
      "denom" in value[0] &&
      "amount" in value[0]
    ) {
      return formatCoins(value as Array<{ denom: string; amount: string }>, restUrl);
    }
    return JSON.stringify(value);
  }
  if (typeof value === "object" && value !== null) {
    if ("denom" in value && "amount" in value) {
      const coin = value as { denom: string; amount: string };
      const meta = await queryCoinMetadata(restUrl, coin.denom);
      return formatOneCoin(coin.amount, coin.denom, meta);
    }
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
  const aminoTypes = new AminoTypes({
    ...createBankAminoConverters(),
    ...createStakingAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createAuthzAminoConverters(),
    ...createVestingAminoConverters(),
  });
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
  aminoTypes: AminoTypes,
  pubkey: Uint8Array,
  address: string,
  bodyBytes: Uint8Array,
  authInfoBytes: Uint8Array,
  restApiAddress: string,
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

    let fields: Record<string, unknown> = {};
    try {
      fields = aminoTypes.toAmino(msg).value as Record<string, unknown>;
    } catch {
      if (msg.value && typeof msg.value === "object") {
        fields = msg.value as Record<string, unknown>;
      }
    }
    for (const [k, v] of Object.entries(fields)) {
      const title = fieldToDisplayName(k);
      const content = await renderFieldValue(v, restApiAddress);
      screens.push({ title, content, indent: 2 });
    }

    screens.push({ content: "End of Message" });
  }

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

  const aminoTypes = new AminoTypes({
    ...createBankAminoConverters(),
    ...createStakingAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createAuthzAminoConverters(),
    ...createVestingAminoConverters(),
  });

  const screens = await buildTextualScreens(
    messages, signerData, option, aminoTypes,
    pubkey, address, bodyBytes, authInfoBytes, restApiAddress,
  );

  const cborBuffer = encodeTextualCbor(screens);

  const signature = await signer.sign(cborBuffer, 0x01);
  if (!signature || signature.length === 0)
    throw new Error("Signature is empty. Please confirm the transaction on your Ledger device.");
  if (signature.length !== 64)
    throw new Error(`Unexpected signature length: ${signature.length} bytes (expected 64)`);

  return TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [signature] });
}
