import Axios, { AxiosInstance } from "axios";
import { Pagination } from "../common";

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
        entries: string;
    };

    entries: {
        redelegation_entry: {
            creation_height: number,
            completion_time: string,
            initial_balance: string,
            shares_dst: string;
        },
        balance: string;
    }[];
}

export interface UndelegationInfo {

    delegator_address: string;
    validator_address: string;

    entries: {
        creation_height: string,
        completion_time: string,
        initial_balance: string,
        balance: string;
    }[];
}

export interface DelegationInfo {

    delegation: {
        delegator_address: string,
        validator_address: string,
        shares: string;
    };

    balance: {
        denom: string,
        amount: string;
    };
}

export interface ValidatorDataType {
    operator_address: string;
    consensus_pubkey: { '@type': string, key: string };
    jailed: boolean;
    status: string;
    tokens: string;
    delegator_shares: string;
    description: {
        moniker: string,
        identity: string,
        website: string,
        security_contact: string,
        details: string;
    };
    unbonding_height: string,
    unbonding_time: string,

    commission: {
        commission_rates: {
            rate: string,
            max_rate: string,
            max_change_rate: string;
        },
        update_time: string;
    };
    min_self_delegation: string;
}

export class StakingQueryClient {
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

    async queryGetUndelegationInfoFromValidator(address: string, validatorAddress: string): Promise<UndelegationInfo> {

        const path =
            `/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations/${address}/unbonding_delegation`;
        const result = await this.axios.get(path);
        // If there is no data in the list, throw 404 exception.

        return result.data.unbond;
    }

    async queryGetDelegationInfoFromValidator(address: string, validatorAddress: string): Promise<DelegationInfo> {

        const path = `/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations/${address}`;
        const result = await this.axios.get(path);

        return result.data.delegation_response;
    }

    async queryGetTotalUndelegateInfo(address: string): Promise<UndelegationInfo[]> {

        const path = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
        const result = await this.axios.get(path);

        return result.data.unbonding_responses;
    }

    async querygetTotalRedelegationInfo(address: string): Promise<RedelegationInfo[]> {

        const path = `/cosmos/staking/v1beta1/delegators/${address}/redelegations`;
        const result = await this.axios.get(path);

        return result.data.redelegation_responses;
    }

    async queryGetUndelegationListFromValidator(valoperAddress: string, paginationKey: string = ""): Promise<{ dataList: UndelegationInfo[], pagination: Pagination }> {

        const path = `/cosmos/staking/v1beta1/validators/${valoperAddress}/unbonding_delegations`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey, "pagination.limit" : 50 } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };

        return { dataList: result.data.unbonding_responses, pagination: convertPagination };
        
    }

    async queryGetDelegateListFromValidator(valoperAddress: string, paginationKey: string = ""): Promise<{ dataList: DelegationInfo[], pagination: Pagination }> {

        const path = `/cosmos/staking/v1beta1/validators/${valoperAddress}/delegations`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey, "pagination.limit" : 50 } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };

        return { dataList: result.data.delegation_responses, pagination: convertPagination };
    }

    async queryGetTotalDelegationInfo(address: string, paginationKey: string = ""): Promise<{ dataList: DelegationInfo[], pagination: Pagination }> {

        const path = `/cosmos/staking/v1beta1/delegations/${address}`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey, "pagination.limit" : 50 } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };

        return { dataList: result.data.delegation_responses, pagination: convertPagination };
    }

    async queryGetParams(): Promise<ParamsDataType> {

        const path = "/cosmos/staking/v1beta1/params";
        const result = await this.axios.get(path);

        return result.data.params;
    }

    async queryGetPool(): Promise<PoolDataType> {

        const path = "/cosmos/staking/v1beta1/pool";
        const result = await this.axios.get(path);

        return result.data.pool;
    }

    async queryValidator(valoperAddress: string): Promise<ValidatorDataType> {

        const path = `/cosmos/staking/v1beta1/validators/${valoperAddress}`;
        const result = await this.axios.get(path);

        return result.data.validator;
    }


    async queryValidators(status: string, paginationKey: string = ""): Promise<{ dataList: ValidatorDataType[], pagination: Pagination }> {

        const path = "/cosmos/staking/v1beta1/validators";
        const result = await this.axios.get(path, { params: { status, "pagination.key": paginationKey, "pagination.limit" : 50 } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };
        return { dataList: result.data.validators, pagination: convertPagination };
    }
}