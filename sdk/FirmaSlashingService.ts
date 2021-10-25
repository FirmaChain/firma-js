import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { SigningInfo, SlashingParam, SlashingQueryClient } from "./firmachain/slashing/SlashingQueryClient";

export class SlashingService {
    constructor(private readonly config: FirmaConfig) { }

    async getSlashingParam(): Promise<SlashingParam> {
        try {
            const queryClient = new SlashingQueryClient(this.config.restApiAddress);
            return await queryClient.queryGetSlashingParam();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getSigningInfos(): Promise<SigningInfo[]> {
        try {
            const queryClient = new SlashingQueryClient(this.config.restApiAddress);
            return await queryClient.queryGetSigningInfos();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getSigningInfo(consAddress: string): Promise<SigningInfo> {
        try {
            const queryClient = new SlashingQueryClient(this.config.restApiAddress);
            return await queryClient.queryGetSigningInfo(consAddress);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}