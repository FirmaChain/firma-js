import Axios, { AxiosInstance } from 'axios';

export interface ParamsDataType {
  unbonding_time: string;
  max_validators: number;
  max_entries: number;
  historical_entries: number;
  bond_denom: string;
}

export interface PoolDataType {
  not_bonded_tokens: string;
  bonded_tokens: string;
}

export interface RedelegationInfo {

  redelegation: {
    delegator_address: string,
    validator_src_address: string,
    validator_dst_address: string,
    entries: string
  };

  entries: {
    redelegation_entry: {
      creation_height: number,
      completion_time: string,
      initial_balance: string,
      shares_dst: string
    },
    balances: string
  }[]
}

export interface UndelegationInfo {

  delegator_address: string;
  validator_address: string;

  entries: {
    creation_height: string,
    completion_time: string,
    initial_balance: string,
    balance: string
  }[]
}

export interface DelegationInfo {

  delegation: {
    delegator_address: string,
    validator_address: string,
    shares: string
  };

  balance: {
    denom: string,
    amount: string
  }
}

export interface ValidatorDataType {
  operator_address: string;
  consensus_pubkey: { typeUrl: string, value: string };
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string,
    identity: string,
    website: string,
    security_contact: string,
    details: string
  };
  unbonding_height: string,
  unbonding_time: string,

  commission: {
    commission_rates: {
      rate: string,
      max_rate: string,
      max_change_rate: string
    },
    update_time: string
  };
  min_self_delegation: string
}

export class StakingQueryClient {
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

  public async queryGetTotalUndelegateInfo(address: string): Promise<UndelegationInfo[]> {

    let path = "/cosmos/staking/v1beta1/delegators" + "/" + address + "/unbonding_delegations";
    var result = await this._axios.get(path);

    return result.data.unbonding_responses;
  }

  public async querygetTotalRedelegationInfo(address: string): Promise<RedelegationInfo[]> {

    let path = "/cosmos/staking/v1beta1/delegators" + "/" + address + "/redelegations";
    var result = await this._axios.get(path);

    return result.data.redelegation_responses;
  }

  public async queryGetUndelegationListFromValidator(address: string): Promise<UndelegationInfo[]> {

    let path = "/cosmos/staking/v1beta1/validators" + "/" + address + "/unbonding_delegations";
    var result = await this._axios.get(path);

    return result.data.unbonding_responses;
  }

  public async queryGetDelegateListFromValidator(address: string): Promise<DelegationInfo[]> {

    let path = "/cosmos/staking/v1beta1/validators" + "/" + address + "/delegations";
    var result = await this._axios.get(path);

    return result.data.delegation_responses;
  }

  public async queryGetTotalDelegationInfo(address: string): Promise<DelegationInfo[]> {

    let path = "/cosmos/staking/v1beta1/delegations" + "/" + address;
    var result = await this._axios.get(path);

    return result.data.delegation_responses;
  }

  public async queryGetParams(): Promise<ParamsDataType> {

    let path = "/cosmos/staking/v1beta1/params";
    var result = await this._axios.get(path);

    return result.data.params;
  }

  public async queryGetPool(): Promise<PoolDataType> {

    let path = "/cosmos/staking/v1beta1/pool";
    var result = await this._axios.get(path);

    return result.data.pool;
  }

  public async queryValidator(valoperAddress: string): Promise<ValidatorDataType> {

    let path = "/cosmos/staking/v1beta1/validators/" + valoperAddress;
    var result = await this._axios.get(path);

    return result.data.validator;
  }

  public async queryValidators(): Promise<ValidatorDataType[]> {

    let path = "/cosmos/staking/v1beta1/validators";
    var result = await this._axios.get(path);

    return result.data.validators;
  }
}