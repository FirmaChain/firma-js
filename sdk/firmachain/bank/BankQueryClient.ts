import Axios, { AxiosInstance } from "axios";

export interface Token {
    denom: string;
    amount: string;
}

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

    async queryTokenBalance(address: string, denom: string): Promise<Token> {

        // changed by cosmos sdk 0.44.5
        const path = `/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`;

        const result = await this.axios.get(path);
        return result.data.balance;
    }

    async queryBalanceList(address: string): Promise<Token[]> {

        const path = `/cosmos/bank/v1beta1/balances/${address}`;

        const result = await this.axios.get(path);
        return result.data.balances;
    }

    async queryBalance(address: string, denom: string): Promise<Token> {

        // changed by cosmos sdk 0.44.5
        const path = `/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`;

        const result = await this.axios.get(path);
        return result.data.balance;
    }
}