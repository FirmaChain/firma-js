import Axios, { AxiosInstance } from 'axios';
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
  private _axios: AxiosInstance;

  constructor(baseUrl: string) {
    this._axios = Axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
      },
      timeout: 15000,
    });
  }

  public async queryGetRewardInfo(address: string, validatorAddress: string): Promise<string> {
    let path = "/cosmos/distribution/v1beta1/delegators" + "/" + address + "/rewards/" + validatorAddress;

    var result = await this._axios.get(path);

    if (result.data.rewards.length == 0) {
      return "0";
    }

    // reward array is very important for refactroing and other functions.
    return result.data.rewards[0].amount;
  }


  public async queryGetValidatorOutStandingReward(address: string): Promise<Coin[]> {
    let path = "/cosmos/distribution/v1beta1/validators" + "/" + address + "/outstanding_rewards";

    var result = await this._axios.get(path);
    return result.data.rewards.rewards;
  }

  public async queryGetValidatorCommission(address: string): Promise<Coin[]> {
    let path = "/cosmos/distribution/v1beta1/validators" + "/" + address + "/commission";

    var result = await this._axios.get(path);
    return result.data.commission.commission;
  }

  public async queryGetTotalRewardInfo(address: string): Promise<TotalRewardInfo> {
    let path = "/cosmos/distribution/v1beta1/delegators" + "/" + address + "/rewards";

    var result = await this._axios.get(path);
    let data = result.data as TotalRewardInfoInternal;

    var finalData: TotalRewardInfo = {
      rewards: [],
      total: ''
    };

    for (var i = 0; i < data.rewards.length; i++) {

      let amount = "0";

      if (data.rewards[i].reward.length != 0) {
        amount = data.rewards[i].reward[0].amount;
      }

      let tempData = { validator_address: data.rewards[i].validator_address, amount: amount };
      finalData.rewards.push(tempData);
    };

    if (data.total.length > 0) {
      finalData.total = data.total[0].amount;
    }

    return finalData;
  }

  public async queryGetCommunityPool(): Promise<string> {
    let path = "/cosmos/distribution/v1beta1/community_pool";

    var result = await this._axios.get(path);
    return result.data.pool[0].amount;
  }

  public async queryGetWithdrawAddress(address: string): Promise<string> {
    let path = "/cosmos/distribution/v1beta1/delegators/" + address + "/withdraw_address";

    var result = await this._axios.get(path);
    return result.data.withdraw_address;
  }
}