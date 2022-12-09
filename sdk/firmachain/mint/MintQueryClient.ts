import Axios, { AxiosInstance } from "axios";

export class MintQueryClient {
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

    async queryInflation(): Promise<string> {
        const path = `/cosmos/mint/v1beta1/inflation`;
        const result = await this.axios.get(path);

        return result.data.inflation;
    }
}