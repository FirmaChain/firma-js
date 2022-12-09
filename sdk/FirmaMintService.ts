import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { MintQueryClient } from "./firmachain/mint";

export class FirmaMintService {

    constructor(private readonly config: FirmaConfig) { }

    async getInflation(): Promise<string> {
        try {
            const queryClient = new MintQueryClient(this.config.restApiAddress);
            return await queryClient.queryInflation();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}