import Axios, { AxiosInstance } from 'axios';
import { Pagination } from '../common';

export interface NftItemType {
  id: string;
  owner: string;
  tokenURI: string;
}

export class NftQueryClient {
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

  public async queryBalanceOf(ownerAddress: string): Promise<string> {
    let path = "/firmachain/firmachain/nft/balanceOf";
    var result = await this._axios.get(path, { params: { ownerAddress: ownerAddress } });

    return result.data.total;
  }

  public async queryTokenOfOwnerByIndex(ownerAddress: string, index: string): Promise<string> {
    let path = "/firmachain/firmachain/nft/tokenOfOwnerByIndex";
    var result = await this._axios.get(path, { params: { ownerAddress: ownerAddress, index: index } });

    return result.data.tokenId;
  }

  public async queryNftItem(nftId: string): Promise<NftItemType> {
    let path = "/firmachain/firmachain/nft/nftItem" + "/" + nftId;
    var result = await this._axios.get(path);

    return result.data.NftItem;
  }

  public async queryNftItemAll(paginationKey: string = ""): Promise<{ dataList: NftItemType[], pagination: Pagination }> {
    let path = "/firmachain/firmachain/nft/nftItem";
    var result = await this._axios.get(path, { params: { "pagination.key": paginationKey } });

    let convertPagination: Pagination = { next_key: result.data.pagination.next_key, total: Number.parseInt(result.data.pagination.total) };
    return { dataList: result.data.NftItem, pagination: convertPagination };
  }
}