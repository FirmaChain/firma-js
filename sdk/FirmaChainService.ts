import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { TendermintQueryClient } from "./firmachain/common/TendermintQueryClient";

export class ChainService {
    constructor(private readonly config: FirmaConfig) { }

    async getChainStatus(): Promise<string> {
        try {
            const queryClient = new TendermintQueryClient(this.config.rpcAddress);
            return await queryClient.queryChainHeight();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTransactionByHash(txHash: string): Promise<string> {
        try {
            const queryClient = new TendermintQueryClient(this.config.rpcAddress);
            return await queryClient.queryTransactionHash(txHash);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}