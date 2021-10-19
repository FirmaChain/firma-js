import Axios, { AxiosInstance } from "axios";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

interface TotalRewardInfoInternal {
    rewards: { validator_address: string, reward: { denom: string, amount: string }[] }[];
    total: { denom: string, amount: string }[];
}

export interface TotalRewardInfo {
    rewards: { validator_address: string, amount: string }[];
    total: string;
}

interface RewardInfoInternal {
    validator_address: string;
    amount: string;
}

export class DistributionQueryClient {
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

    async queryGetRewardInfo(address: string, validatorAddress: string): Promise<string> {
        const path = `/cosmos/distribution/v1beta1/delegators/${address}/rewards/${validatorAddress}`;

        const result = await this.axios.get(path);

        if (result.data.rewards.length === 0) {
            return "0";
        }

        // reward array is very important for refactoring and other functions.
        return result.data.rewards[0].amount;
    }


    async queryGetValidatorOutStandingReward(address: string): Promise<Coin[]> {
        const path = `/cosmos/distribution/v1beta1/validators/${address}/outstanding_rewards`;

        const result = await this.axios.get(path);
        return result.data.rewards.rewards;
    }

    async queryGetValidatorCommission(address: string): Promise<Coin[]> {
        const path = `/cosmos/distribution/v1beta1/validators/${address}/commission`;

        const result = await this.axios.get(path);
        return result.data.commission.commission;
    }

    async queryGetTotalRewardInfo(address: string): Promise<TotalRewardInfo> {
        const path = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;

        const result = await this.axios.get(path);
        const data = result.data as TotalRewardInfoInternal;

        const finalData: TotalRewardInfo = {
            rewards: [],
            total: ""
        };

        for (let i = 0; i < data.rewards.length; i++) {

            let amount = "0";

            if (data.rewards[i].reward.length !== 0) {
                amount = data.rewards[i].reward[0].amount;
            }

            const tempData = { validator_address: data.rewards[i].validator_address, amount: amount };
            finalData.rewards.push(tempData);
        };

        if (data.total.length > 0) {
            finalData.total = data.total[0].amount;
        }

        return finalData;
    }

    async queryGetCommunityPool(): Promise<string> {
        const path = "/cosmos/distribution/v1beta1/community_pool";

        const result = await this.axios.get(path);
        return result.data.pool[0].amount;
    }

    async queryGetWithdrawAddress(address: string): Promise<string> {
        const path = `/cosmos/distribution/v1beta1/delegators/${address}/withdraw_address`;

        const result = await this.axios.get(path);
        return result.data.withdraw_address;
    }
}