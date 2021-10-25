import Axios, { AxiosInstance } from "axios";

export interface ChainSyncInfo {
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: string;
    latest_block_time: string;
    earliest_block_hash: string;
    earliest_app_hash: string;
    earliest_block_height: string;
    earliest_block_time: string;
    catching_up: boolean;
}

export interface TransactionEvent {
    type: string;
    attributes: {
        key: string,
        value: string,
        index: boolean
    }[];
}

export interface TransactionHash {
    hash: string;
    height: string;
    index: number;
    tx_result: {
        code: number,
        data: string,
        log: string,
        info: string,
        gas_wanted: string,
        gas_used: string,
        events: TransactionEvent[],
        codespace: string
    }
    tx: string;
}

export class TendermintQueryClient {
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

    async queryEstimateGas(hexTx: string): Promise<number> {

        const path = "/abci_query?path=\"app/simulate\"";
        const result = await this.axios.get(path, { params: { data: hexTx } });

        const data = result.data.result.response.value;
        const jsonString = Buffer.from(data, "base64").toString("utf8");

        const jsonData = JSON.parse(jsonString);

        return Number.parseInt(jsonData.gas_info.gas_used);
    }

    async queryChainSyncInfo(): Promise<ChainSyncInfo> {

        const path = "/status";
        const result = await this.axios.get(path);

        return result.data.result.sync_info;
    }

    async queryTransactionHash(txHash: string): Promise<TransactionHash> {

        const path = "/tx?hash=" + txHash;
        const result = await this.axios.get(path);

        return result.data.result;
    }
}

// https://imperium-lcd.firmachain.org:26657/abci_query?path=%22app/simulate%22&data=0x0a9b010a8d010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126d0a2c6669726d6131747271796c65396d326e7679616663326e323566726b70776564323530347936617667667a72122c6669726d6131306e65336e77346b63666a36766a7a38346c326d33676a38767961637a66686d6135666636391a0f0a0475666374120731303030303030120974657374206d656d6f12670a510a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21027b57273b1d23a87862c6a47f214d77b6144b552498c2dff9e9368551b4e08a8c12040a02080118e60412120a0c0a047566637412043230303010c09a0c1a40ce1072ff09660c80595b7ff2fec36062ebcf8fde88947f1fa3f6cb5ff808edba04fcf584f81ce52e5ec9be6724759fb58a411a17ed2816210f4df5b811117e4c 
// 6669726d613177613375346b6e773734723539387175767a7964766361343271736d6b366a727667716e3779
// curl 'http://0.0.0.0:26657/abci_query?path="/store/acc/key"&data=0x6669726d6131383934767470336461756d737a70397a36306564657074736a786a6667656d656a73646b3277'
// curl 'http://0.0.0.0:26657/abci_query?path="/account/tbnb1hn8ym9xht925jkncjpf7lhjnax6z8nv2mu9wy3'