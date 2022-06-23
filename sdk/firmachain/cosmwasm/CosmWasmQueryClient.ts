import Axios, { AxiosInstance } from "axios";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export interface CodeInfo {
    code_id: string;
    creator: string;
    data_hash: string;
}

export interface CodeData {
    code_info: CodeInfo;
    data: string;
}

export interface ContractInfo {
    address: string;
    contract_info: {
        code_id: string;
        creator: string;
        admin: string;
        label: string;
        created: {block_height: string; tx_index: string};
        ibc_port_id: string;
        extension: {"@type": string;}
    }
}

export interface ContractHistoryInfo {
    operation: string;
    code_id: string;
    updated: {
        block_height: string;
        tx_index: string
    }
    msg: string;
}

export interface ContractStateInfo {
    key: string;
    value: string;
}

export class CosmWasmQueryClient {
    private readonly axios: AxiosInstance;

    constructor(baseUrl: string) {
        this.axios = Axios.create({
            baseURL: baseUrl,
            headers: {
                Accept: "application/json",
            },
            timeout: 15000,
        });
    }

    async getCodeInfoList(): Promise<CodeInfo[]> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/code" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/code`;
        const result = await this.axios.get(path);

        return result.data.code_infos;
    }

    async getCodeData(codeId: string): Promise<CodeData> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/code/1" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/code/${codeId}`;
        const result = await this.axios.get(path);

        return result.data;
    }

    async getContractListFromCodeId(codeId: string): Promise<string[]> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/code/1/contracts" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/code/${codeId}/contracts`;
        const result = await this.axios.get(path);

        return result.data.contracts;
    }

    async getContractInfo(contractAddress: string): Promise<ContractInfo> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/contract/firma1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqawnxf2" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/contract/${contractAddress}`;
        const result = await this.axios.get(path);

        return result.data;
    }

    async getContractHistory(contractAddress: string): Promise<ContractHistoryInfo[]> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/contract/firma1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqawnxf2/history" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/contract/${contractAddress}/history`;
        const result = await this.axios.get(path);

        return result.data.entries;
    }

    async getContractRawQueryData(contractAddress: string, hexString: string): Promise<string> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/contract/firma1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqawnxf2/raw/ewogICJyZXNvbHZlX3JlY29yZCI6IHsKICAgICJuYW1lIjogImZyZWQiCiAgfQp9" -H  "accept: application/json"

        let hexStringBase64 = Buffer.from(hexString, 'hex').toString('base64');

        const path = `/cosmwasm/wasm/v1/contract/${contractAddress}/raw/${hexStringBase64}`;
        const result = await this.axios.get(path);

        return result.data;
    }

    async getContractSmartQueryData(contractAddress: string, query: string): Promise<string> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/contract/firma1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqawnxf2/smart/ewogICJyZXNvbHZlX3JlY29yZCI6IHsKICAgICJuYW1lIjogImZyZWQiCiAgfQp9" -H  "accept: application/json"

        let queryBase64 = Buffer.from(query, 'binary').toString('base64');

        const path = `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${queryBase64}`;
        const result = await this.axios.get(path);

        return result.data.data;
    }

    async getContractState(contractAddress: string): Promise<ContractStateInfo[]> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/contract/firma1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqawnxf2/state" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/contract/${contractAddress}/state`;
        const result = await this.axios.get(path);

        return result.data.models;
    }

    async getPinnedCodeList(): Promise<string[]> {

        //curl -X GET "http://0.0.0.0:1317/cosmwasm/wasm/v1/codes/pinned" -H  "accept: application/json"

        const path = `/cosmwasm/wasm/v1/codes/pinned`;
        const result = await this.axios.get(path);

        return result.data.code_ids;
    }
}