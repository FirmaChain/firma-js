import Axios, { AxiosInstance } from "axios";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";


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
}