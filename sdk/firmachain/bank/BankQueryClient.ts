import Axios, { AxiosInstance } from 'axios';

export class BankQueryClient {
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

  public async querySupplyOf(denom: string) : Promise<string> {
    let path = "/cosmos/bank/v1beta1/supply/" + denom;

    var result = await this._axios.get(path);
    return result.data.amount.amount;
  }

  public async queryBalance(address: string, denom: string): Promise<string> {

    let path = "/cosmos/bank/v1beta1/balances/" + address + "/" + denom;

    var result = await this._axios.get(path);
    return result.data.balance.amount;
  }
}