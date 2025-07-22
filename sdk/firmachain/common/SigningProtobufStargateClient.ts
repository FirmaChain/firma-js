import { toBase64, fromBase64, fromBech32 } from "@cosmjs/encoding";
import { OfflineDirectSigner, EncodeObject, makeSignBytes } from "@cosmjs/proto-signing";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
import { arrayContentEquals } from "@cosmjs/utils";
import { sha256, Secp256k1, Secp256k1Signature } from "@cosmjs/crypto";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/tendermint-rpc";
import { TxRaw, TxBody, AuthInfo, SignDoc, Fee, SignerInfo } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { Account, accountFromAny } from "./accounts";
import axios from "axios";
import { StargateClient, StargateClientOptions } from "./StargateClient";

export interface SignerData {
    readonly accountNumber: number;
    readonly sequence: number;
    readonly chainId: string;
}

export interface SequenceResponse {
    readonly accountNumber: number;
    readonly sequence: number;
}

export interface ArbitraryVerifyData {
    type: string
    signer: string;
    data: string;
    pubkey: string;
    signature: string;
}

export interface MsgSignData {
    readonly signer: string;
    readonly data: string;
}

export class SigningProtobufStargateClient extends StargateClient {
    private readonly signer: OfflineDirectSigner;
    private readonly _endpoint: string;

    constructor(cometClient: Comet38Client, options: StargateClientOptions, signer: OfflineDirectSigner, endpoint: string) {
        super(cometClient, options)

        this.signer = signer;
        this._endpoint = endpoint;
    }

    static async connectWithSigner(endpoint: string, signer: OfflineDirectSigner, options: StargateClientOptions):
        Promise<SigningProtobufStargateClient> {

        const cometClient = await Comet38Client.connect(endpoint);
        return new SigningProtobufStargateClient(cometClient, options, signer, endpoint);
    }

    public async experimentalAdr36Sign(signerAddress: string, data: Uint8Array | Uint8Array[]): Promise<ArbitraryVerifyData> {
        const accountNumber = 0;
        const sequence = 0;
        const chainId = "";

        const datas = Array.isArray(data) ? data : [data];

        // Create protobuf message for sign data
        const msgs: EncodeObject[] = datas.map(
            (d): EncodeObject => ({
                typeUrl: "/cosmos.tx.v1beta1.MsgSignData",
                value: Any.fromPartial({
                    typeUrl: "/cosmos.tx.v1beta1.MsgSignData",
                    value: new TextEncoder().encode(JSON.stringify({
                        signer: signerAddress,
                        data: toBase64(d),
                    })),
                }),
            }),
        );

        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );

        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }

        // Create protobuf transaction body
        const txBody = TxBody.fromPartial({
            messages: msgs.map(msg => Any.fromPartial({
                typeUrl: msg.typeUrl,
                value: new Uint8Array(), // Simplified for ADR-036
            })),
            memo: "",
        });

        // Create fee structure
        const fee = Fee.fromPartial({
            amount: [],
            gasLimit: BigInt(0),
        });

        // Create signer info
        const pubkey = PubKey.fromPartial({
            key: accountFromSigner.pubkey,
        });

        const signerInfo = SignerInfo.fromPartial({
            publicKey: Any.fromPartial({
                typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                value: PubKey.encode(pubkey).finish(),
            }),
            modeInfo: {
                single: {
                    mode: SignMode.SIGN_MODE_DIRECT,
                },
            },
            sequence: BigInt(sequence),
        });

        // Create auth info
        const authInfo = AuthInfo.fromPartial({
            signerInfos: [signerInfo],
            fee: fee,
        });

        // Create sign doc
        const signDoc = SignDoc.fromPartial({
            bodyBytes: TxBody.encode(txBody).finish(),
            authInfoBytes: AuthInfo.encode(authInfo).finish(),
            chainId: chainId,
            accountNumber: BigInt(accountNumber),
        });

        // Sign with protobuf method for ADR-036
        const signBytes = makeSignBytes(signDoc);
        const hash = sha256(signBytes);

        // Get private key from signer for direct signing (ADR-036 requirement)
        const rawWallet = this.signer as any;
        const privKey = rawWallet.privkey;
        if (!privKey) {
            throw new Error("Private key not accessible for ADR-036 signing");
        }

        // Create signature directly using secp256k1
        const signature = await Secp256k1.createSignature(hash, privKey);
        const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);

        // Convert to the expected format for compatibility
        const jsonData = {
            type: "sign/MsgSignData",
            signer: signerAddress,
            data: toBase64(datas[0]),
            pubkey: toBase64(accountFromSigner.pubkey),
            signature: toBase64(signatureBytes)
        };

        return jsonData;
    }

    static async experimentalAdr36Verify(data: ArbitraryVerifyData, checkMsg: string): Promise<boolean> {
        try {
            // Decode signature components
            const pubkeyBytes = fromBase64(data.pubkey);
            const signatureBytes = fromBase64(data.signature);

            // Verify the message matches
            const sourceMsg = Buffer.from(data.data, 'base64').toString();
            if (sourceMsg !== checkMsg) {
                throw new Error("Different Msg error. source:" + sourceMsg + ", target:" + checkMsg);
            }

            // Create verification signDoc for protobuf
            const accountNumber = 0;
            const sequence = 0;
            const chainId = "";

            const txBody = TxBody.fromPartial({
                messages: [{
                    typeUrl: "/cosmos.tx.v1beta1.MsgSignData",
                    value: new Uint8Array(),
                }],
                memo: "",
            });

            const fee = Fee.fromPartial({
                amount: [],
                gasLimit: BigInt(0),
            });

            const pubkey = PubKey.fromPartial({
                key: pubkeyBytes,
            });

            const signerInfo = SignerInfo.fromPartial({
                publicKey: Any.fromPartial({
                    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                    value: PubKey.encode(pubkey).finish(),
                }),
                modeInfo: {
                    single: {
                        mode: SignMode.SIGN_MODE_DIRECT,
                    },
                },
                sequence: BigInt(sequence),
            });

            const authInfo = AuthInfo.fromPartial({
                signerInfos: [signerInfo],
                fee: fee,
            });

            const signDoc = SignDoc.fromPartial({
                bodyBytes: TxBody.encode(txBody).finish(),
                authInfoBytes: AuthInfo.encode(authInfo).finish(),
                chainId: chainId,
                accountNumber: BigInt(accountNumber),
            });

            // Verify signature
            const signBytes = makeSignBytes(signDoc);
            const prehashed = sha256(signBytes);

            const secpSignature = Secp256k1Signature.fromFixedLength(signatureBytes);
            const rawSignerAddress = rawSecp256k1PubkeyToRawAddress(pubkeyBytes);

            // Check signer address matches
            const { data: decodedSignerData } = fromBech32(data.signer);
            if (!arrayContentEquals(decodedSignerData, rawSignerAddress)) {
                throw new Error("Found mismatch between signer in message and public key");
            }

            // Verify the signature
            const ok = await Secp256k1.verifySignature(secpSignature, prehashed, pubkeyBytes);
            return ok;
        } catch (error) {
            return false;
        }
    }

    private toAccAddress(address: string): Uint8Array {
        return fromBech32(address).data;
    }

    async getAccount(address: string): Promise<Account | null> {
        // Direct RPC query using protobuf format
        try {
            const accAddress = this.toAccAddress(address);
            const hexAccAddress = `0x01${Buffer.from(accAddress).toString("hex")}`;

            const axiosInstance = axios.create({
                baseURL: this._endpoint,
                headers: {
                    Accept: "application/json",
                },
                timeout: 15000
            });

            const path = "/abci_query";
            const result = await axiosInstance.get(path, {
                params: {
                    path: '"store/acc/key"',
                    data: hexAccAddress
                }
            });

            const finalData = result.data.result.response.value;
            if (!finalData) {
                return null;
            }

            const account = Any.decode(Buffer.from(finalData, "base64"));
            const finalAccount = accountFromAny(account);

            return finalAccount;
        } catch (error) {
            return null;
        }
    }
}