import Axios, { AxiosInstance } from "axios";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Pagination } from ".";
import { AuthorizationType, SendAuthorization } from "./AuthzTxTypes";


export interface GrantSendData {
    authorization: authorization_send;
    expiration: string; // date string
}

export interface GrantGenericData {
    authorization: authorization_generic;
    expiration: string; // date string
}

export interface GrantStakingData {
    authorization: authorization_staking;
    expiration: string; // date string
}

export interface authorization_send {
    "@type": string;
    spend_limit: Coin[];
}

export interface authorization_generic {
    "@type": string;
    msg: string;
}

export interface authorization_staking {
    "@type": string;
    max_tokens: Coin;
    allow_list: allowList;
    authorization_type: string;
}

export interface allowList {
    address: string[];
}

export class AuthzQueryClient {
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

    async getSendGrantData(granterAddress: string, granteeAddress: string, paginationKey: string = ""): Promise<{ dataList: GrantSendData[], pagination: Pagination }> {

        // curl -X GET "https://lcd-testnet.firmachain.dev:1317/cosmos/authz/v1beta1/grants?granter=firma1jmg3kwy5hntx66nl93dyk2d92943394qsf6gcf&grantee=firma166hahxpg3ykkrxsgttdcj5ha97kv68y96wlujl" -H  "accept: application/json"

        let msgType = "/cosmos.bank.v1beta1.MsgSend";

        const path = `/cosmos/authz/v1beta1/grants?granter=${granterAddress}&grantee=${granteeAddress}&msg_type_url=${msgType}`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        // INFO: special case to use Pagination

        let convertPagination: Pagination = {
            next_key: "",
            total: result.data.grants.length
        };

        if (result.data.pagination != null) {
            convertPagination.next_key = result.data.pagination.next_key;
            convertPagination.total = Number.parseInt(result.data.pagination.total);
        }

        return { dataList: result.data.grants, pagination: convertPagination };
    }

    async getGenericGrantData(granterAddress: string, granteeAddress: string, msgType: string, paginationKey: string = ""): Promise<{ dataList: GrantGenericData[], pagination: Pagination }> {

        // curl -X GET "https://lcd-testnet.firmachain.dev:1317/cosmos/authz/v1beta1/grants?granter=firma1jmg3kwy5hntx66nl93dyk2d92943394qsf6gcf&grantee=firma166hahxpg3ykkrxsgttdcj5ha97kv68y96wlujl" -H  "accept: application/json"

        const path = `/cosmos/authz/v1beta1/grants?granter=${granterAddress}&grantee=${granteeAddress}&msg_type_url=${msgType}`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        // INFO: special case to use Pagination

        let convertPagination: Pagination = {
            next_key: "",
            total: result.data.grants.length
        };

        if (result.data.pagination != null) {
            convertPagination.next_key = result.data.pagination.next_key;
            convertPagination.total = Number.parseInt(result.data.pagination.total);
        }

        return { dataList: result.data.grants, pagination: convertPagination };
    }

    async getStakingGrantData(granterAddress: string, granteeAddress: string, type: AuthorizationType, paginationKey: string = ""): Promise<{ dataList: GrantStakingData[], pagination: Pagination }> {

        // curl -X GET "https://lcd-testnet.firmachain.dev:1317/cosmos/authz/v1beta1/grants?granter=firma1jmg3kwy5hntx66nl93dyk2d92943394qsf6gcf&grantee=firma166hahxpg3ykkrxsgttdcj5ha97kv68y96wlujl" -H  "accept: application/json"

        // prevent to list all grant data when msgType is empty string.
        let msgType = "none";

        switch (type) {
            case AuthorizationType.AUTHORIZATION_TYPE_DELEGATE:
                msgType = "/cosmos.staking.v1beta1.MsgDelegate";
                break;

            case AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE:
                msgType = "/cosmos.staking.v1beta1.MsgUndelegate";
                break;

            case AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE:
                msgType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
                break;
        }

        const path = `/cosmos/authz/v1beta1/grants?granter=${granterAddress}&grantee=${granteeAddress}&msg_type_url=${msgType}`;
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        // INFO: special case to use Pagination

        let convertPagination: Pagination = {
            next_key: "",
            total: result.data.grants.length
        };

        if (result.data.pagination != null) {
            convertPagination.next_key = result.data.pagination.next_key;
            convertPagination.total = Number.parseInt(result.data.pagination.total);
        }

        return { dataList: result.data.grants, pagination: convertPagination };
    }
}