import { Registry, EncodeObject, makeSignBytes } from "@cosmjs/proto-signing";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, fromBech32, toBase64, toUtf8 } from "@cosmjs/encoding";

import { ArbitraryVerifyData, SignAndBroadcastOptions } from ".";
import { AuthInfo, SignDoc, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { FirmaWalletService } from "../../FirmaWalletService";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { Any } from "cosmjs-types/google/protobuf/any";
import { FirmaUtil } from "../../FirmaUtil";
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

        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet);
        const address = (await this.rawWallet.getAccounts())[0].address;

        return await client.sign(address, msgs, fee, memo);
    }

    async broadcast(txRaw: TxRaw): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet);
        const txBytes = TxRaw.encode(txRaw).finish();

        return await client.broadcastTx(txBytes);
    }

    async broadcastTxBytes(txBytes: Uint8Array): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet);
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

        // Create arbitrary data message
        const arbitraryMsg = Any.fromPartial({
            typeUrl: "/cosmos.base.v1beta1.MsgSignArbitraryData",
            value: Uint8Array.from([
                // Simple encoding: signer address length + address + data
                ...toUtf8(signerAddress).length.toString().padStart(2, '0').split('').map(c => c.charCodeAt(0)),
                ...toUtf8(signerAddress),
                ...data
            ])
        });

        // Create TxBody
        const txBody = TxBody.fromPartial({
            messages: [arbitraryMsg],
            memo: "",
            timeoutHeight: BigInt(0),
        });

        // Create AuthInfo (empty for arbitrary signing)
        const authInfo = AuthInfo.fromPartial({
            signerInfos: [],
            fee: {
                amount: [],
                gasLimit: BigInt(0),
                payer: "",
                granter: ""
            }
        });

        // Create SignDoc
        const signDoc = SignDoc.fromPartial({
            bodyBytes: TxBody.encode(txBody).finish(),
            authInfoBytes: AuthInfo.encode(authInfo).finish(),
            chainId: "",
            accountNumber: BigInt(0),
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
            pubkey: FirmaUtil.arrayBufferToBase64(account.pubkey),
            signature: FirmaUtil.arrayBufferToBase64(sigBytes),
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

            // Verify the message content
            const txBody = TxBody.decode(signDoc.bodyBytes);
            if (txBody.messages.length !== 1) {
                throw new Error("Invalid message count");
            }

            const arbitraryMsg = txBody.messages[0];
            if (arbitraryMsg.typeUrl !== "/cosmos.base.v1beta1.MsgSignArbitraryData") {
                throw new Error("Invalid message type");
            }

            // Extract and verify the original data
            const msgValue = arbitraryMsg.value;
            const signerAddressUtf8 = toUtf8(data.signerAddress);
            const expectedPrefix = [
                ...signerAddressUtf8.length.toString().padStart(2, '0').split('').map(c => c.charCodeAt(0)),
                ...signerAddressUtf8
            ];
            
            // Check if the message contains our expected data structure
            const extractedData = msgValue.slice(expectedPrefix.length);
            if (!arrayContentEquals(extractedData, originalMessage)) {
                throw new Error("Message data mismatch");
            }

            // Verify signature
            const signBytes = makeSignBytes(signDoc);
            const hash = sha256(signBytes);

            const pubkeyBytes = fromBase64(data.pubkey);
            const signatureBytes = fromBase64(data.signature);
            const secpSig = Secp256k1Signature.fromFixedLength(signatureBytes);

            // Verify address matches pubkey
            const rawSignerAddr = rawSecp256k1PubkeyToRawAddress(pubkeyBytes);
            const bech32SignerAddr = fromBech32(data.signerAddress).data;
            
            if (!rawSignerAddr || !bech32SignerAddr || !arrayContentEquals(rawSignerAddr, bech32SignerAddr)) {
                throw new Error("Signer address mismatch");
            }

            return await Secp256k1.verifySignature(secpSig, hash, pubkeyBytes);

        } catch (error) {
            console.error("Verification failed:", error);
            return false;
        }
    }
}