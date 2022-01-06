import Axios, { AxiosInstance } from "axios";
import { Pagination } from "../common";

export interface NftItemType {
    id: string;
    owner: string;
    tokenURI: string;
}

export class NftQueryClient {
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

    async queryBalanceOf(ownerAddress: string): Promise<string> {
        const path = "/firmachain/firmachain/nft/balanceOf";
        const result = await this.axios.get(path, { params: { ownerAddress: ownerAddress } });

        return result.data.total;
    }

    async queryNftIdListOfOwner(ownerAddress: string, paginationKey: string): Promise<{ nftIdList: string[], pagination: Pagination }> {
        const path = "/firmachain/firmachain/nft/nftIdListOfOwner";
        const result = await this.axios.get(path, { params: { ownerAddress: ownerAddress, "pagination.key": paginationKey } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };

        return { nftIdList: result.data.nftIdList, pagination: convertPagination };
    }

    async queryNftItem(nftId: string): Promise<NftItemType> {
        const path = "/firmachain/firmachain/nft/nftItem/" + nftId;
        const result = await this.axios.get(path);

        return result.data.NftItem;
    }

    async queryNftItemAll(paginationKey: string = ""): Promise<{ dataList: NftItemType[], pagination: Pagination }> {
        const path = "/firmachain/firmachain/nft/nftItem";
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };
        return { dataList: result.data.NftItem, pagination: convertPagination };
    }
}