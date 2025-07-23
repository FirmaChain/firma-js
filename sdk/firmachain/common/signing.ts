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
    gasLimit: number,
    granter?: string,
    payer?: string,
    signMode: SignMode = SignMode.SIGN_MODE_DIRECT,
): Uint8Array {
    const fee = Fee.fromPartial({
        amount: [...feeAmount],
        gasLimit: BigInt(gasLimit),
        granter: granter || "",
        payer: payer || "",
    });

    const authInfo = AuthInfo.fromPartial({
        signerInfos: makeSignerInfos(signers, signMode),
        fee: fee,
    });
    
    return AuthInfo.encode(authInfo).finish();
}

export function makeSignDoc(
    bodyBytes: Uint8Array,
    authInfoBytes: Uint8Array,
    chainId: string,
    accountNumber: number,
): SignDoc {
    return SignDoc.fromPartial({
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        chainId: chainId,
        accountNumber: BigInt(accountNumber),
    });
}

export function makeSignBytes(signDoc: SignDoc): Uint8Array {
    // Ensure all required fields are present
    if (!signDoc.bodyBytes || !signDoc.authInfoBytes || !signDoc.chainId || signDoc.accountNumber === undefined) {
        throw new Error("SignDoc is missing required fields");
    }

    const doc = SignDoc.fromPartial({
        accountNumber: signDoc.accountNumber,
        authInfoBytes: signDoc.authInfoBytes,
        bodyBytes: signDoc.bodyBytes,
        chainId: signDoc.chainId,
    });
    
    return SignDoc.encode(doc).finish();
}

/**
 * Creates AuthInfo bytes for protobuf signing with enhanced type safety
 */
export function makeAuthInfoBytesProtobuf(
    signers: ReadonlyArray<SignerData>,
    feeAmount: readonly Coin[],
    gasLimit: bigint | number,
    granter?: string,
    payer?: string,
): Uint8Array {
    const normalizedGasLimit = typeof gasLimit === 'bigint' ? gasLimit : BigInt(gasLimit);
    
    const fee = Fee.fromPartial({
        amount: feeAmount.map(coin => Coin.fromPartial(coin)),
        gasLimit: normalizedGasLimit,
        granter: granter || "",
        payer: payer || "",
    });

    const signerInfos = signers.map(({ pubkey, sequence }) =>
        SignerInfo.fromPartial({
            publicKey: pubkey,
            modeInfo: {
                single: { mode: SignMode.SIGN_MODE_DIRECT },
            },
            sequence: BigInt(sequence),
        })
    );

    const authInfo = AuthInfo.fromPartial({
        signerInfos: signerInfos,
        fee: fee,
    });
    
    return AuthInfo.encode(authInfo).finish();
}

/**
 * Creates a protobuf SignDoc with validation
 */
export function makeSignDocProtobuf(
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

    const normalizedAccountNumber = typeof accountNumber === 'bigint' ? accountNumber : BigInt(accountNumber);

    return SignDoc.fromPartial({
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        chainId: chainId,
        accountNumber: normalizedAccountNumber,
    });
}