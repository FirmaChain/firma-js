import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { ChainSyncInfo, TendermintQueryClient, TransactionHash } from "./firmachain/common/TendermintQueryClient";

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
}