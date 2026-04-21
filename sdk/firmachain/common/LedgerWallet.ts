import { EncodeObject, Registry } from "@cosmjs/proto-signing";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, SignerInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { PubKey as Secp256k1PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
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

export interface LedgerWalletInterface {
  getAddress(): Promise<string>;
  sign(message: string | Buffer, txtype?: number): Promise<Uint8Array>;
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

function cborMajorN(major: number, n: number): Buffer {
  const type = major << 5;
  if (n <= 23) return Buffer.from([type | n]);
  if (n <= 0xff) return Buffer.from([type | 24, n]);
  if (n <= 0xffff) return Buffer.from([type | 25, (n >> 8) & 0xff, n & 0xff]);
  const b = Buffer.alloc(5);
  b[0] = type | 26;
  b.writeUInt32BE(n, 1);
  return b;
}

function cborUint(n: number): Buffer {
  return cborMajorN(0, n);
}

function cborText(s: string): Buffer {
  const utf8 = Buffer.from(s, "utf8");
  return Buffer.concat([cborMajorN(3, utf8.length), utf8]);
}

interface TextualScreen {
  title?: string;
  content: string;
  indent?: number;
  expert?: boolean;
}

function encodeSingleScreen(screen: TextualScreen): Buffer {
  const parts: Buffer[] = [];
  let fieldCount = 0;

  if (screen.title !== undefined) {
    parts.push(cborUint(1), cborText(screen.title));
    fieldCount++;
  }

  parts.push(cborUint(2), cborText(screen.content));
  fieldCount++;

  if (screen.indent !== undefined && screen.indent > 0) {
    parts.push(cborUint(3), cborUint(screen.indent));
    fieldCount++;
  }

  if (screen.expert === true) {
    parts.push(cborUint(4), Buffer.from([0xf5])); // CBOR true
    fieldCount++;
  }

  return Buffer.concat([cborMajorN(5, fieldCount), ...parts]);
}

function encodeTextualCbor(screens: TextualScreen[]): Buffer {
  const screenBuffers = screens.map(encodeSingleScreen);
  const array = Buffer.concat([cborMajorN(4, screens.length), ...screenBuffers]);
  // Root map: {1: [screens]}
  return Buffer.concat([cborMajorN(5, 1), cborUint(1), array]);
}

// ─── Screen builder ──────────────────────────────────────────────────────────

function buildTextualScreens(
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  aminoTypes: AminoTypes,
): TextualScreen[] {
  const screens: TextualScreen[] = [];

  screens.push({ title: "Chain ID", content: signerData.chain_id });
  screens.push({ title: "Account number", content: signerData.account_number.toString() });
  screens.push({ title: "Sequence", content: signerData.sequence.toString() });

  const count = messages.length;
  screens.push({ title: "Messages", content: count.toString() });

  messages.forEach((msg, i) => {
    screens.push({ title: `Message (${i + 1}/${count})`, content: msg.typeUrl });
    try {
      const amino = aminoTypes.toAmino(msg);
      for (const [k, v] of Object.entries(amino.value as Record<string, unknown>)) {
        screens.push({
          title: k,
          content: typeof v === "string" ? v : JSON.stringify(v),
          indent: 1,
        });
      }
    } catch {
      if (msg.value && typeof msg.value === "object") {
        for (const [k, v] of Object.entries(msg.value as Record<string, unknown>)) {
          screens.push({
            title: k,
            content: typeof v === "string" ? v : JSON.stringify(v),
            indent: 1,
          });
        }
      }
    }
  });

  const feeStr = option.fee.amount.map((c) => `${c.amount} ${c.denom}`).join(", ") || "0";
  screens.push({ title: "Fee", content: feeStr });
  screens.push({ title: "Gas limit", content: option.fee.gasLimit.toString() });

  if (option.memo) {
    screens.push({ title: "Memo", content: option.memo });
  }

  return screens;
}

// ─── AuthInfo helpers ────────────────────────────────────────────────────────

function makeAuthInfoBytes(
  mode: SignMode,
  pubkey: Any,
  feeAmount: readonly Coin[],
  gasLimit: bigint,
  sequence: number,
  granter?: string,
  payer?: string,
): Uint8Array {
  const signerInfo: SignerInfo = {
    publicKey: pubkey,
    modeInfo: { single: { mode } },
    sequence: BigInt(sequence),
  };
  const authInfo = AuthInfo.fromPartial({
    signerInfos: [signerInfo],
    fee: {
      amount: [...feeAmount],
      gasLimit,
      granter: granter || "",
      payer: payer || "",
    },
  });
  return AuthInfo.encode(authInfo).finish();
}

// ─── Textual signing (SIGN_MODE_TEXTUAL, P2=0x01) ────────────────────────────

export async function signWithSignerTextual(
  signer: LedgerWalletInterface,
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  registry: Registry,
): Promise<TxRaw> {
  try {
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

    const screens = buildTextualScreens(messages, signerData, option, aminoTypes);
    const cborBuffer = encodeTextualCbor(screens);

    const signature = await signer.sign(cborBuffer, 0x01);

    if (!signature || signature.length === 0) {
      throw new Error("Signature is empty. Please confirm the transaction on your Ledger device.");
    }
    if (signature.length !== 64) {
      throw new Error(`Unexpected signature length: ${signature.length} bytes (expected 64)`);
    }

    const anyMsgs = messages.map((msg) => registry.encodeAsAny(msg));
    const txBody = TxBody.fromPartial({ messages: anyMsgs, memo: option.memo || "" });
    const bodyBytes = TxBody.encode(txBody).finish();

    const feeCoins: Coin[] = option.fee.amount.map((a) => ({ denom: a.denom, amount: a.amount }));
    const authInfoBytes = makeAuthInfoBytes(
      SignMode.SIGN_MODE_TEXTUAL,
      pubkeyProto,
      feeCoins,
      BigInt(option.fee.gasLimit),
      signerData.sequence,
      option.fee.granter || undefined,
      option.fee.payer || undefined,
    );

    return TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [signature] });

  } catch (e) {
    console.error("[Textual] error:", e);
    throw e;
  }
}
