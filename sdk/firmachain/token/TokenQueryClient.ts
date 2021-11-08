import { Uint64 } from "@cosmjs/math";
import Axios, { AxiosInstance } from "axios";
import { Pagination } from "../common";

export interface TokenDataType {
    tokenID: string;
    name: string;
    symbol: string;
    tokenURI: string;
    totalSupply: number;
    decimal: number;
    mintable: boolean;
    burnable: boolean;
    mintSequence: number;
    burnSequence: number;
    owner: string;
}

export class TokenQueryClient {
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

    async queryTokenDataFromOwner(ownerAddress: string): Promise<string[]> {
        const path = "/firmachain/firmachain/token/getTokenList";
        const result = await this.axios.get(path, { params: { "ownerAddress": ownerAddress } });

        return result.data.tokenID;
    }

    async queryTokenData(tokenID: string): Promise<TokenDataType> {
        const path = "/firmachain/firmachain/token/tokenData/" + tokenID;
        const result = await this.axios.get(path);

        return result.data.tokenData;
    }

    async queryTokenDataAll(paginationKey: string = ""): Promise<{ dataList: TokenDataType[], pagination: Pagination }> {
        const path = "/firmachain/firmachain/token/tokenData";
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };
        return { dataList: result.data.tokenData, pagination: convertPagination };
    }
}