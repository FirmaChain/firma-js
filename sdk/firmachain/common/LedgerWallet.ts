import { EncodeObject, encodePubkey, makeSignDoc, Registry, TxBodyEncodeObject } from "@cosmjs/proto-signing";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, SignDoc, SignerInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { SignAndBroadcastOptions } from "./TxCommon";
import { toBase64 } from "@cosmjs/encoding";
import { PubKey as Secp256k1PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";

export interface LedgerWalletInterface {
  getAddress(): Promise<string>;
  sign(message: string): Promise<Uint8Array>; // Must return Uint8Array for protobuf mode 
  getPublicKey(): Promise<Uint8Array>;
  getAddressAndPublicKey(): Promise<{ address: string; publicKey: Uint8Array }>;
  showAddressOnDevice?(): Promise<void>; // Optional
}

export interface SignerData {
  readonly account_number: number;
  readonly sequence: number;
  readonly chain_id: string;
}

// Creates AuthInfoBytes for "SIGN_MODE_DIRECT"
function makeAuthInfoBytesDirect(
  pubkey: Any,
  feeAmount: readonly Coin[],
  gasLimit: number,
  sequence: number
): Uint8Array {
  const signerInfo: SignerInfo = {
    publicKey: pubkey,
    modeInfo: {
      single: { mode: SignMode.SIGN_MODE_DIRECT },
    },
    sequence: BigInt(sequence),
  };

  const authInfo = {
    signerInfos: [signerInfo],
    fee: {
      amount: [...feeAmount],
      gasLimit: BigInt(gasLimit),
    },
  };

  return AuthInfo.encode(AuthInfo.fromPartial(authInfo)).finish();
}

/**
 * Signs a protobuf-based Cosmos transaction using a general Signer
 * compatible with SIGN_MODE_DIRECT (e.g. Ledger, Keplr, etc.)
 *
 * @param signer - SignerInterface instance
 * @param messages - Cosmos transaction messages
 * @param signerData - Chain ID, account number, sequence
 * @param option - Fee, memo, granter info
 * @param registry - Protobuf registry for message encoding
 * @returns TxRaw - fully signed transaction
 */
export async function signWithSignerProtobuf(
  signer: LedgerWalletInterface,
  messages: EncodeObject[],
  signerData: SignerData,
  option: SignAndBroadcastOptions,
  registry: Registry,
): Promise<TxRaw> {
  // 1. Encode messages
  const anyMsgs = messages.map((msg) => registry.encodeAsAny(msg));

  const txBody = TxBody.fromPartial({
    messages: anyMsgs,
    memo: option.memo || "",
  });

  const bodyBytes = TxBody.encode(txBody).finish();

  // 2. AuthInfo (fee + signer info)
  const pubkey = await signer.getPublicKey();

  const pubkeyProto: Any = {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: Secp256k1PubKey.encode({ key: pubkey }).finish(),
  };

  const feeAmount: Coin[] = option.fee.amount.map((a) => ({
    denom: a.denom,
    amount: a.amount,
  }));

  // Use makeAuthInfoBytesDirect function for consistency
  const authInfoBytes = makeAuthInfoBytesDirect(
    pubkeyProto,
    feeAmount,
    parseInt(option.fee.gas),
    signerData.sequence
  );

  const signDoc = SignDoc.fromPartial({
    bodyBytes,
    authInfoBytes,
    chainId: signerData.chain_id,
    accountNumber: BigInt(signerData.account_number),
  });

  // Verify SignDoc has all required fields
  if (!signDoc.chainId) {
    throw new Error(`SignDoc chainId is missing: ${signDoc.chainId}`);
  }
  if (!signDoc.accountNumber) {
    throw new Error(`SignDoc accountNumber is missing: ${signDoc.accountNumber}`);
  }

  // Create proper SignDoc protobuf bytes for Ledger
  const signDocBytes = SignDoc.encode(signDoc).finish();
  const base64SignBytes = toBase64(signDocBytes);
  
  let signature: Uint8Array | undefined;
  let lastError: any;

  // FirmaChain dedicated app supports Protobuf, so only try Protobuf formats
  const protobufAttempts = [
    { name: "SignDoc Base64", data: base64SignBytes },
    { name: "SignDoc Hex", data: Buffer.from(signDocBytes).toString('hex') },
    { name: "SignDoc Hex with 0x", data: '0x' + Buffer.from(signDocBytes).toString('hex') },
  ];
  
  for (const attempt of protobufAttempts) {
    try {
      signature = await signer.sign(attempt.data);
      
      if (signature && signature.length > 0) {
        break; // Success! Exit loop
      }
      
    } catch (signError) {
      lastError = signError;
      continue; // Try next format
    }
  }

  // If all Protobuf attempts failed, provide guidance
  if (!signature || signature.length === 0) {
    const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`FirmaChain Ledger app signing failed: ${errorMsg}. Please ensure FirmaChain app is properly installed and up to date.`);
  }
  
  // Signature validation
  if (!signature || signature.length === 0) {
    throw new Error("Signature is empty. Please confirm that the transaction was approved on Ledger or check Ledger connection.");
  }
  
  if (signature.length !== 64) {
    throw new Error(`Unexpected signature length: ${signature.length} bytes (expected: 64 bytes)`);
  }

  const txRaw = TxRaw.fromPartial({
    bodyBytes,
    authInfoBytes,
    signatures: [signature],
  });
  
  return txRaw;
}

