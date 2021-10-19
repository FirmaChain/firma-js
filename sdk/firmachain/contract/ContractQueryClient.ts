import Axios, { AxiosInstance } from "axios";
import { Pagination } from "../common";

export interface ContractLogType {
    creator: string;
    id: string;
    timeStamp: string;
    eventName: string;
    ownerAddress: string;
    jsonString: string;
}

export interface ContractFileType {
    creator: string;
    fileHash: string;
    timeStamp: string;
    ownerList: string[];
    metaDataJsonString: string;
}

export class ContractQueryClient {
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

    async queryIsContractOwner(fileHash: string, ownerAddress: string): Promise<boolean> {
        const path = "/firmachain/firmachain/contract/isContractOwner";
        const result = await this.axios.get(path, { params: { fileHash: fileHash, ownerAddress: ownerAddress } });

        return result.data.result;
    }

    async queryContractFile(fileHash: string): Promise<ContractFileType> {
        const path = `/firmachain/firmachain/contract/contractFile/${fileHash}`;
        const result = await this.axios.get(path);

        return result.data.ContractFile;
    }

    async queryContractFileAll(paginationKey: string = ""): Promise<{
        dataList: ContractFileType[],
        pagination: Pagination; }> {
        const path = "/firmachain/firmachain/contract/contractFile";
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };
        return { dataList: result.data.ContractFile, pagination: convertPagination };
    }

    async queryContractLog(logId: string): Promise<ContractLogType> {
        const path = `/firmachain/firmachain/contract/contractLog/${logId}`;
        const result = await this.axios.get(path);

        return result.data.ContractLog;
    }

    async queryContractLogAll(paginationKey: string = ""): Promise<{
        dataList: ContractLogType[],
        pagination: Pagination; }> {
        const path = "/firmachain/firmachain/contract/contractLog";
        const result = await this.axios.get(path, { params: { "pagination.key": paginationKey } });

        const convertPagination: Pagination = {
            next_key: result.data.pagination.next_key,
            total: Number.parseInt(result.data.pagination.total)
        };
        return { dataList: result.data.ContractLog, pagination: convertPagination };
    }
}