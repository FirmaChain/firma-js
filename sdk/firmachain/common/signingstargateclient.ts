import { fromBase64 } from "@cosmjs/encoding";
import { Bech32 } from "@cosmjs/encoding";
import { EncodeObject, encodePubkey, makeSignDoc, OfflineDirectSigner, Registry, TxBodyEncodeObject } from
    "@cosmjs/proto-signing";

import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { AuthInfo, SignerInfo, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { StdFee } from ".";
import { Account, accountFromAny } from "./accounts";

import { BroadcastTxResponse, StargateClient } from "./stargateclient";
import Axios from "axios";
import { Int53 } from "@cosmjs/math";
import { Any } from "../google/protobuf/any";
import Long from "long";
import { encodeSecp256k1Pubkey } from "../amino/encoding";

export interface SignerData {
    readonly accountNumber: number;
    readonly sequence: number;
    readonly chainId: string;
}

export interface SequenceResponse {
    readonly accountNumber: number;
    readonly sequence: number;
}

export class SigningStargateClient extends StargateClient {

    private readonly signer: OfflineDirectSigner;
    private readonly registry: Registry;
    private chainId: string | undefined;

    private static _endpoint = "";

    static async connectWithSigner(endpoint: string, signer: OfflineDirectSigner, registry: Registry):
        Promise<SigningStargateClient> {

        this._endpoint = endpoint;
        const tmClient = await Tendermint34Client.connect(endpoint);
        return new SigningStargateClient(tmClient, signer, registry);
    }

    protected constructor(tmClient: Tendermint34Client | undefined, signer: OfflineDirectSigner, registry: Registry) {
        super(tmClient);
        this.registry = registry;
        this.signer = signer;
    }

    async signAndBroadcast(signerAddress: string, messages: readonly EncodeObject[], fee: StdFee, memo = ""):
        Promise<BroadcastTxResponse> {
        const txRaw = await this.sign(signerAddress, messages, fee, memo);
        const txBytes = TxRaw.encode(txRaw).finish();
        return this.broadcastTx(txBytes);
    }

    async sign(signerAddress: string,
        messages: readonly EncodeObject[],
        fee: StdFee,
        memo: string,
        explicitSignerData?: SignerData): Promise<TxRaw> {
        let signerData: SignerData;
        if (explicitSignerData) {
            signerData = explicitSignerData;
        } else {
            const { accountNumber, sequence } = await this.getSequence(signerAddress);
            const chainId = await this.getChainId();
            signerData = {
                accountNumber: accountNumber,
                sequence: sequence,
                chainId: chainId,
            };
        }

        return this.signDirect(signerAddress, messages, fee, memo, signerData);
    }

    async getChainId(): Promise<string> {
        if (!this.chainId) {
            const response = await this.forceGetTmClient().status();
            const chainId = response.nodeInfo.network;
            if (!chainId) throw new Error("Chain ID must not be empty");
            this.chainId = chainId;
        }

        return this.chainId!;
    }

    /**
   * Takes a bech32 encoded address and returns the data part. The prefix is ignored and discarded.
   * This is called AccAddress in Cosmos SDK, which is basically an alias for raw binary data.
   * The result is typically 20 bytes long but not restricted to that.
   */
    private toAccAddress(address: string): Uint8Array {
        return Bech32.decode(address).data;
    }

    async getAccount(address: string): Promise<Account | undefined> {
        // http://192.168.126.130:26657/abci_query?path=%22/store/acc/key%22&data=0x017763cada6ef547429c1c6088d663b55021bb6a43

        try {

            const accAddress = this.toAccAddress(address);
            const hexAccAddress = `0x01${Buffer.from(accAddress).toString("hex")}`;

            const axios = Axios.create({
                baseURL: SigningStargateClient._endpoint,
                headers: {
                    Accept: "application/json",
                },
                timeout: 15000
            });

            const path = "/abci_query?path=\"/store/acc/key\"";
            const result = await axios.get(path, { params: { data: hexAccAddress } });

            const finalData = result.data.result.response.value;
            const account = Any.decode(Buffer.from(finalData, "base64"));

            const finalAccount = accountFromAny(account);

            return finalAccount;
        } catch (error) {
            return undefined;
        }
    }

    async getSequence(address: string): Promise<SequenceResponse> {
        const account = await this.getAccount(address);
        if (!account) {
            throw new Error("Account does not exist on chain. Send some tokens there before trying to query sequence.");
        }
        return {
            accountNumber: account.accountNumber,
            sequence: account.sequence,
        };
    }

    private makeSignerInfos(signers: ReadonlyArray<{ readonly pubkey: Any; readonly sequence: number }>,
        signMode: SignMode): SignerInfo[] {
        return signers.map(
            ({ pubkey, sequence }): SignerInfo => ({
                publicKey: pubkey,
                modeInfo: {
                    single: { mode: signMode },
                },
                sequence: Long.fromNumber(sequence),
            }),
        );
    }

    private makeAuthInfoBytes(signers: ReadonlyArray<{ pubkey: Any; sequence: number }>,
        feeAmount: Coin[],
        gasLimit: number,
        granter: string,
        signMode = SignMode.SIGN_MODE_DIRECT): Uint8Array {
        const authInfo = {
            signerInfos: this.makeSignerInfos(signers, signMode),
            fee: {
                amount: [...feeAmount],
                gasLimit: Long.fromNumber(gasLimit),
                granter: granter,
            },
        };
        return AuthInfo.encode(AuthInfo.fromPartial(authInfo)).finish();
    }

    private async signDirect(
        signerAddress: string,
        messages: readonly EncodeObject[],
        fee: StdFee,
        memo: string,
        { accountNumber, sequence, chainId }: SignerData,
    ): Promise<TxRaw> {

        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );
        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }
        const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
        const txBodyEncodeObject: TxBodyEncodeObject = {
            typeUrl: "/cosmos.tx.v1beta1.TxBody",
            value: {
                messages: messages,
                memo: memo,
            },
        };

        const txBodyBytes = this.registry.encode(txBodyEncodeObject);
        const gasLimit = Int53.fromString(fee.gas).toNumber();
        const authInfoBytes = this.makeAuthInfoBytes([{ pubkey, sequence }], fee.amount, gasLimit, fee.granter);
        const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
        const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);
        return TxRaw.fromPartial({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [fromBase64(signature.signature)],
        });
    }
}