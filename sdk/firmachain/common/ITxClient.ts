import { Registry, EncodeObject, makeSignBytes } from "@cosmjs/proto-signing";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, fromBech32, toBase64, toUtf8 } from "@cosmjs/encoding";

import { ArbitraryVerifyData, SignAndBroadcastOptions } from ".";
import { AuthInfo, SignDoc, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { FirmaWalletService } from "../../FirmaWalletService";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { Any } from "cosmjs-types/google/protobuf/any";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/tendermint-rpc";
import { arrayContentEquals } from "@cosmjs/utils";

export class ITxClient {

    private rawWallet: DirectSecp256k1Wallet;

    constructor(private readonly wallet: FirmaWalletService,
        private readonly serverUrl: string,
        private readonly registry: Registry) {

        this.rawWallet = wallet.getRawWallet();
    }

    public getRegistry(): Registry { return this.registry; }

    async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {

        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        const address = (await this.rawWallet.getAccounts())[0].address;

        return await client.sign(address, msgs, fee, memo);
    }

    async broadcast(txRaw: TxRaw): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        const txBytes = TxRaw.encode(txRaw).finish();

        return await client.broadcastTx(txBytes);
    }

    async broadcastTxBytes(txBytes: Uint8Array): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        return await client.broadcastTx(txBytes);
    }

    async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<DeliverTxResponse> {
        return await this.broadcast(await this.sign(msgs, { fee, memo }));
    }

    public async experimentalProtobufArbitrarySign(signerAddress: string, data: Uint8Array): Promise<ArbitraryVerifyData> {
        const accounts = await this.rawWallet.getAccounts();
        const account = accounts.find(acc => acc.address === signerAddress);
        if (!account) {
            throw new Error("Account not found in rawWallet");
        }

        // ADR-036 compatible: Create empty transaction with arbitrary data as memo
        // This is more compatible with standard ADR-036 approach
        const txBody = TxBody.fromPartial({
            messages: [], // Empty messages for arbitrary signing
            memo: new TextDecoder().decode(data), // Store arbitrary data in memo field
            timeoutHeight: BigInt(0),
        });

        // Create minimal AuthInfo for ADR-036
        const authInfo = AuthInfo.fromPartial({
            signerInfos: [],
            fee: {
                amount: [],
                gasLimit: BigInt(0),
                payer: "",
                granter: ""
            }
        });

        // Create SignDoc following ADR-036 pattern
        const signDoc = SignDoc.fromPartial({
            bodyBytes: TxBody.encode(txBody).finish(),
            authInfoBytes: AuthInfo.encode(authInfo).finish(),
            chainId: "", // Empty for arbitrary signing
            accountNumber: BigInt(0), // 0 for arbitrary signing
        });

        // Sign the document
        const signBytes = makeSignBytes(signDoc);
        const hash = sha256(signBytes);

        const privKey = (this.rawWallet as any)["privkey"];
        const signature = await Secp256k1.createSignature(hash, privKey);
        const sigBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);

        return {
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber.toString(),
            sequence: "0",
            bodyBytes: toBase64(signDoc.bodyBytes),
            authInfoBytes: toBase64(signDoc.authInfoBytes),
            signerAddress: signerAddress,
            pubkey: toBase64(account.pubkey),
            signature: toBase64(sigBytes),
        };
    }

    static async experimentalProtobufArbitraryVerify(data: ArbitraryVerifyData, originalMessage: Uint8Array): Promise<boolean> {
        try {
            // Reconstruct SignDoc
            const signDoc = SignDoc.fromPartial({
                bodyBytes: fromBase64(data.bodyBytes),
                authInfoBytes: fromBase64(data.authInfoBytes),
                chainId: data.chainId,
                accountNumber: BigInt(data.accountNumber),
            });

            // Verify the message content - ADR-036 style with memo
            const txBody = TxBody.decode(signDoc.bodyBytes);
            
            // For ADR-036 arbitrary signing, messages should be empty
            if (txBody.messages.length !== 0) {
                console.log("Invalid message count - should be 0 for arbitrary signing");
                return false;
            }

            // Extract data from memo field
            const memoData = txBody.memo;
            const originalMessageString = new TextDecoder().decode(originalMessage);
            
            if (memoData !== originalMessageString) {
                console.log("Message data mismatch in memo");
                return false;
            }

            // Verify signature
            const signBytes = makeSignBytes(signDoc);
            const hash = sha256(signBytes);

            try {
                const pubkeyBytes = fromBase64(data.pubkey);
                const signatureBytes = fromBase64(data.signature);
                
                const secpSig = Secp256k1Signature.fromFixedLength(signatureBytes);

                // Verify address matches pubkey
                const rawSignerAddr = rawSecp256k1PubkeyToRawAddress(pubkeyBytes);
                const bech32SignerAddr = fromBech32(data.signerAddress).data;
                
                if (!rawSignerAddr || !bech32SignerAddr || !arrayContentEquals(rawSignerAddr, bech32SignerAddr)) {
                    console.log("Signer address mismatch");
                    return false;
                }

                const isValid = await Secp256k1.verifySignature(secpSig, hash, pubkeyBytes);
                
                return isValid;
            } catch (error: any) {
                console.log("Signature verification error:", error.message);
                return false;
            }

        } catch (error) {
            console.error("Verification failed:", error);
            return false;
        }
    }
}