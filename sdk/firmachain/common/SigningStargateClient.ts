import { fromBase64, fromBech32 } from "@cosmjs/encoding";
import { 
  EncodeObject,
  OfflineDirectSigner,
  Registry,
  GeneratedType
} from "@cosmjs/proto-signing";
import { CometClient, connectComet, HttpEndpoint } from "@cosmjs/tendermint-rpc";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { SignDoc, TxRaw, TxBody, Fee } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import axios from "axios";

import { Account, accountFromAny } from "./accounts";
import { DeliverTxResponse, StargateClient, StargateClientOptions } from "./StargateClient";
import { Any } from "cosmjs-types/google/protobuf/any";
import {
  authzTypes,
  bankTypes,
  distributionTypes,
  feegrantTypes,
  govTypes,
  groupTypes,
  ibcTypes,
  stakingTypes,
  vestingTypes,
} from "@cosmjs/stargate/build/modules";
import { makeAuthInfoBytesProtobuf, makeSignDocProtobuf } from "./signing";

export const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.base.v1beta1.Coin", Coin],
  ...authzTypes,
  ...bankTypes,
  ...distributionTypes,
  ...feegrantTypes,
  ...govTypes,
  ...groupTypes,
  ...stakingTypes,
  ...ibcTypes,
  ...vestingTypes,
];

export interface SignerData {
    readonly accountNumber: number;
    readonly sequence: number;
    readonly chainId: string;
}

export interface SequenceResponse {
    readonly accountNumber: number;
    readonly sequence: number;
}

export interface TxRawExt {
    readonly txRaw: TxRaw;
    readonly signature: string;
}

export interface SigningStargateClientOptions extends StargateClientOptions {
  readonly registry?: Registry;
}

export class SigningStargateClient extends StargateClient {
    public readonly registry: Registry;
    private readonly signer: OfflineDirectSigner;
    private static _endpoint = "";

    static async connectWithSigner(
        endpoint: string | HttpEndpoint, 
        signer: OfflineDirectSigner, 
        options: SigningStargateClientOptions = {}
    ): Promise<SigningStargateClient> {
        const cometClient = await connectComet(endpoint);
        return SigningStargateClient.createWithSigner(cometClient, signer, options);
    }

    static async createWithSigner(
        cometClient: CometClient,
        signer: OfflineDirectSigner,
        options: SigningStargateClientOptions = {}
    ): Promise<SigningStargateClient> {
        return new SigningStargateClient(cometClient, signer, options);
    }

    protected constructor(
        cometClient: CometClient | undefined, 
        signer: OfflineDirectSigner, 
        options: SigningStargateClientOptions
    ) {
        super(cometClient, options);
        const { registry = new Registry(defaultRegistryTypes) } = options;
        this.registry = registry;
        this.signer = signer;
    }

    async signAndBroadcast(
        signerAddress: string, 
        messages: readonly EncodeObject[], 
        fee: Fee, 
        memo = ""
    ): Promise<DeliverTxResponse> {
        const txRaw = await this.sign(signerAddress, messages, fee, memo);
        const txBytes = TxRaw.encode(txRaw).finish();
        return this.broadcastTx(txBytes);
    }

    public static async makeSignDocForSend(
        signerAddress: string,
        pubkeyStr: string,
        messages: readonly EncodeObject[],
        fee: Fee,
        memo: string,
        serverUrl: string,
        chainId: string,
        registry: Registry
    ): Promise<SignDoc> {
        SigningStargateClient._endpoint = serverUrl;

        const { accountNumber, sequence } = await SigningStargateClient.getSequence(signerAddress);
        const account = await SigningStargateClient.getAccount(signerAddress);

        if (account == null)
            throw new Error("Failed to retrieve account from signer");

        const pubkeyBytes = fromBase64(pubkeyStr);
        const pubkey = PubKey.fromPartial({
            key: pubkeyBytes,
        });

        const pubkeyAny: Any = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PubKey.encode(pubkey).finish(),
        };

        const anyMsgs = messages.map((msg) => registry.encodeAsAny(msg));
        
        const txBody = TxBody.fromPartial({
            messages: anyMsgs,
            memo: memo,
        });

        const bodyBytes = TxBody.encode(txBody).finish();

        const authInfoBytes = makeAuthInfoBytesProtobuf(
            [{ pubkey: pubkeyAny, sequence }],
            fee.amount,
            fee.gasLimit,
            fee.granter,
            fee.payer
        );

        return makeSignDocProtobuf(bodyBytes, authInfoBytes, chainId, accountNumber);
    }

    async sign(
        signerAddress: string,
        messages: readonly EncodeObject[],
        fee: Fee,
        memo: string,
        explicitSignerData?: SignerData
    ): Promise<TxRaw> {
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

    private async signDirect(
        signerAddress: string,
        messages: readonly EncodeObject[],
        fee: Fee,
        memo: string,
        { accountNumber, sequence, chainId }: SignerData,
    ): Promise<TxRaw> {
        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );
        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }

        const pubkey = PubKey.fromPartial({
            key: accountFromSigner.pubkey,
        });

        const pubkeyAny: Any = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PubKey.encode(pubkey).finish(),
        };

        const anyMsgs = messages.map((msg) => this.registry.encodeAsAny(msg));
        
        const txBody = TxBody.fromPartial({
            messages: anyMsgs,
            memo: memo,
        });

        const bodyBytes = TxBody.encode(txBody).finish();

        const authInfoBytes = makeAuthInfoBytesProtobuf(
            [{ pubkey: pubkeyAny, sequence }],
            fee.amount,
            fee.gasLimit,
            fee.granter,
            fee.payer
        );

        const signDoc = makeSignDocProtobuf(bodyBytes, authInfoBytes, chainId, accountNumber);

        const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);
        
        return TxRaw.fromPartial({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [fromBase64(signature.signature)],
        });
    }

    public async signDirectForSignDoc(signerAddress: string, signDoc: SignDoc): Promise<TxRawExt> {
        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );
        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }
        
        const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);

        const txRaw = TxRaw.fromPartial({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [fromBase64(signature.signature)],
        });

        return { txRaw: txRaw, signature: signature.signature };
    }

    static async getSequence(address: string): Promise<SequenceResponse> {
        const account = await this.getAccount(address);
        if (!account) {
            throw new Error("Account does not exist on chain. Send some tokens there before trying to query sequence.");
        }
        return {
            accountNumber: account.accountNumber,
            sequence: account.sequence,
        };
    }

    static async getAccount(address: string): Promise<Account | null> {
        try {
            const accAddress = fromBech32(address).data;
            const hexAccAddress = `0x01${Buffer.from(accAddress).toString("hex")}`;

            const axiosInstance = axios.create({
                baseURL: SigningStargateClient._endpoint,
                headers: {
                    Accept: "application/json",
                },
                timeout: 15000
            });

            const path = "/abci_query?path=\"/store/acc/key\"";
            const result = await axiosInstance.get(path, { params: { data: hexAccAddress } });

            const finalData = result.data.result.response.value;
            const account = Any.decode(Buffer.from(finalData, "base64"));

            return accountFromAny(account);
        } catch (error) {
            return null;
        }
    }
}