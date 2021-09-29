import Axios, { AxiosInstance } from 'axios';
import { Pagination } from '../common';

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

  public async queryIsContractOwner(fileHash: string, ownerAddress: string): Promise<boolean> {
    let path = "/firmachain/firmachain/contract/isContractOwner";
    var result = await this._axios.get(path, { params: { fileHash: fileHash, ownerAddress: ownerAddress } });

    return result.data.result;
  }

  public async queryContractFile(fileHash: string): Promise<ContractFileType> {
    let path = "/firmachain/firmachain/contract/contractFile" + "/" + fileHash;
    var result = await this._axios.get(path);

    return result.data.ContractFile;
  }

  public async queryContractFileAll(paginationKey: string = ""): Promise<{ dataList: ContractFileType[], pagination: Pagination }> {
    let path = "/firmachain/firmachain/contract/contractFile";
    var result = await this._axios.get(path, { params: { "pagination.key": paginationKey } });

    let convertPagination: Pagination = { next_key: result.data.pagination.next_key, total: Number.parseInt(result.data.pagination.total) };
    return { dataList: result.data.ContractFile, pagination: convertPagination };
  }

  public async queryContractLog(logId: string): Promise<ContractLogType> {
    let path = "/firmachain/firmachain/contract/contractLog" + "/" + logId;
    var result = await this._axios.get(path);

    return result.data.ContractLog;
  }

  public async queryContractLogAll(paginationKey: string = ""): Promise<{ dataList: ContractLogType[], pagination: Pagination }> {
    let path = "/firmachain/firmachain/contract/contractLog";
    var result = await this._axios.get(path, { params: { "pagination.key": paginationKey } });

    let convertPagination: Pagination = { next_key: result.data.pagination.next_key, total: Number.parseInt(result.data.pagination.total) };
    return { dataList: result.data.ContractLog, pagination: convertPagination };
  }
}