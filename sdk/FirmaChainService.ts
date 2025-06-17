import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { ChainSyncInfo, TendermintQueryClient, TransactionHash } from "./firmachain/common/TendermintQueryClient";
import Axios from "axios";

export class ChainService {
    constructor(private readonly config: FirmaConfig) { }

    async getChainSyncInfo(): Promise<ChainSyncInfo> {
        try {
            const queryClient = new TendermintQueryClient(this.config.rpcAddress);
            return await queryClient.queryChainSyncInfo();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTransactionByHash(txHash: string): Promise<TransactionHash> {
        try {
            const queryClient = new TendermintQueryClient(this.config.rpcAddress);
            return await queryClient.queryTransactionHash(txHash);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getChainInfo() {
        try {

            const axios = Axios.create({
                baseURL: this.config.restApiAddress,
                headers: {
                    Accept: "application/json",
                },
                timeout: 15000,
            });

            const path = `/cosmos/base/tendermint/v1beta1/node_info`;
            const result = await axios.get(path);

            const nodeInfo = result.data.default_node_info;
            const appInfo = result.data.application_version;

            const chainId: string = nodeInfo.network;
            const appVersion: string = appInfo.version;
            let cosmosVersion: string = "";
                    
            for(let i = 0; i < appInfo.build_deps.length; i++) {
                const dep = appInfo.build_deps[i];

                if(dep.path == "github.com/cosmos/cosmos-sdk"){
                    cosmosVersion = dep.version;
                    break;
                }
            }
            
            return {chainId, appVersion, cosmosVersion};

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    
}