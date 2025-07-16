import { Bech32 } from "@cosmjs/encoding";

import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Account, accountFromAny } from "./accounts";

import { StargateClient } from "./stargateclient";
import Axios from "axios";
import { Any } from "../google/protobuf/any";

export interface SignerData {
    readonly account_number: string;
    readonly sequence: string;
    readonly chain_id: string;
}

export interface SequenceResponse {
    readonly account_number: string;
    readonly sequence: string;
}

export class LedgerSigningStargateClient extends StargateClient {

    private chainId: string | undefined;
    private static _endpoint = "";

    static async connectWithSigner(endpoint: string): Promise<LedgerSigningStargateClient> {

        this._endpoint = endpoint;
        const tmClient = await Tendermint34Client.connect(endpoint);
        return new LedgerSigningStargateClient(tmClient);
    }

    protected constructor(tmClient: Tendermint34Client) {
        super(tmClient);
    }

    async getSignerData(address: string): Promise<SignerData> {

        let chainID = await this.getChainId();
        let account = await this.getAccount(address);

        if (account == null)
            throw new Error("account is null");

        return { account_number: account.accountNumber.toString(), sequence: account.sequence.toString(), chain_id: chainID };
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
                baseURL: LedgerSigningStargateClient._endpoint,
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
}