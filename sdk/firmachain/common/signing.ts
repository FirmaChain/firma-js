/* eslint-disable @typescript-eslint/naming-convention */
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, SignDoc, SignerInfo, Fee } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";

export interface SignerData {
    readonly pubkey: Any;
    readonly sequence: number;
}

function makeSignerInfos(
    signers: ReadonlyArray<SignerData>,
    signMode: SignMode,
): SignerInfo[] {
    return signers.map(
        ({ pubkey, sequence }): SignerInfo =>
            SignerInfo.fromPartial({
                publicKey: pubkey,
                modeInfo: {
                    single: { mode: signMode },
                },
                sequence: BigInt(sequence),
            }),
    );
}

export function makeAuthInfoBytes(
    signers: ReadonlyArray<SignerData>,
    feeAmount: readonly Coin[],
    gasLimit: bigint | number,
    granter?: string,
    payer?: string,
    signMode: SignMode = SignMode.SIGN_MODE_DIRECT,
): Uint8Array {
    const fee = Fee.fromPartial({
        amount: [...feeAmount],
        gasLimit: typeof gasLimit === "bigint" ? gasLimit : BigInt(gasLimit),
        granter: granter || "",
        payer: payer || "",
    });

    const authInfo = AuthInfo.fromPartial({
        signerInfos: makeSignerInfos(signers, signMode),
        fee,
    });

    return AuthInfo.encode(authInfo).finish();
}

export function makeSignDoc(
    bodyBytes: Uint8Array,
    authInfoBytes: Uint8Array,
    chainId: string,
    accountNumber: bigint | number,
): SignDoc {
    if (!bodyBytes || bodyBytes.length === 0) {
        throw new Error("bodyBytes cannot be empty");
    }
    if (!authInfoBytes || authInfoBytes.length === 0) {
        throw new Error("authInfoBytes cannot be empty");
    }
    if (!chainId) {
        throw new Error("chainId cannot be empty");
    }

    return SignDoc.fromPartial({
        bodyBytes,
        authInfoBytes,
        chainId,
        accountNumber: typeof accountNumber === "bigint" ? accountNumber : BigInt(accountNumber),
    });
}

export function makeSignBytes(signDoc: SignDoc): Uint8Array {
    if (!signDoc.bodyBytes || !signDoc.authInfoBytes || !signDoc.chainId || signDoc.accountNumber === undefined) {
        throw new Error("SignDoc is missing required fields");
    }
    return SignDoc.encode(signDoc).finish();
}

// Backward-compatible aliases for existing callers
export const makeAuthInfoBytesProtobuf = makeAuthInfoBytes;
export const makeSignDocProtobuf = makeSignDoc;
