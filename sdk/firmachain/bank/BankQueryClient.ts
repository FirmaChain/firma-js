import Axios, { AxiosInstance } from "axios";

export class BankQueryClient {
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

    async querySupplyOf(denom: string): Promise<string> {
        const path = `/cosmos/bank/v1beta1/supply/${denom}`;

        const result = await this.axios.get(path);
        return result.data.amount.amount;
    }

    async queryBalance(address: string, denom: string): Promise<string> {

        const path = `/cosmos/bank/v1beta1/balances/${address}/${denom}`;

        const result = await this.axios.get(path);
        return result.data.balance.amount;
    }
}