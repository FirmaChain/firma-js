import { fromBech32 } from "@cosmjs/encoding";
import { CometClient, connectComet, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { StargateClient, StargateClientOptions } from "./stargateclient";
import { Account, accountFromAny } from "./accounts";
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
        LedgerSigningStargateClient._endpoint = endpoint;
        const tempCometClient = await connectComet(endpoint);
        return new LedgerSigningStargateClient(tempCometClient, {});
    }

  protected constructor(cometClient: CometClient, options: StargateClientOptions) {
    super(cometClient, options);
  }
  
  async getSignerData(address: string): Promise<SignerData> {
    const chainID = await this.getChainId();
    const account = await this.getAccount(address);
    
    if (!account) throw new Error("Account not found");

    return {
      account_number: account.accountNumber.toString(),
      sequence: account.sequence.toString(),
      chain_id: chainID,
    };
  }

  async getChainId(): Promise<string> {
    if (!this.chainId) {
      const status = await this.forceGetCometClient().status();
      const chainId = status.nodeInfo.network;
      
      if (!chainId) throw new Error("Chain ID must not be empty");
      this.chainId = chainId;
    }
    return this.chainId;
  }

  private toAccAddress(address: string): Uint8Array {
    return fromBech32(address).data;
  }

  async getAccount(address: string): Promise<Account | null> {
    try {
      const accAddress = this.toAccAddress(address);
      const hexAccAddress = `0x01${Buffer.from(accAddress).toString("hex")}`;

      const axios = Axios.create({
        baseURL: LedgerSigningStargateClient._endpoint,
        headers: { Accept: "application/json" },
        timeout: 15000,
      });

      const path = "/abci_query";
      const params = {
        path: "/store/acc/key",
        data: hexAccAddress,
      };

      const response = await axios.get(path, { params });

      const base64Value = response.data.result.response.value;
      if (!base64Value) return null;

      const decoded = Buffer.from(base64Value, "base64");
      const account = Any.decode(decoded);
      const finalAccount = accountFromAny(account);

      return finalAccount;
    } catch (error) {
      console.error("getAccount error:", error);
      return null;
    }
  }
}