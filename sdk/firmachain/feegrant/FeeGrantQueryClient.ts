import Axios, { AxiosInstance } from "axios";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export interface FeeAllowanceType {
    granter: string;
    grantee: string;
    allowance: FeeAllowanceType1;
}

export interface FeeAllowanceType1 {
    "@type": string;
    spendLimit: Coin[];
    expiration: Date | undefined;
}

export class FeeGrantQueryClient {
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

    async getGranteeAllowance(granterAddress: string, granteeAddress: string): Promise<FeeAllowanceType1> {

        // curl -X GET "http://0.0.0.0:1317/cosmos/feegrant/v1beta1/allowance/cosmos1wa3u4knw74r598quvzydvca42qsmk6jrzmgy07/cosmos1skc6cpuwnqr6m3ee68pdhwl29qwx2r98c4my7x" -H  "accept: application/json"

        const path = `/cosmos/feegrant/v1beta1/allowance/${granterAddress}/${granteeAddress}`;
        const result = await this.axios.get(path);

        return result.data.allowance.allowance;
    }

    async getGranteeAllowanceAll(granteeAddress: string): Promise<FeeAllowanceType[]> {

        // curl -X GET "http://192.168.40.129:1317/cosmos/feegrant/v1beta1/allowances/cosmos1skc6cpuwnqr6m3ee68pdhwl29qwx2r98c4my7x" -H  "accept: application/json"

        const path = `/cosmos/feegrant/v1beta1/allowances/${granteeAddress}`;

        const result = await this.axios.get(path);
        return result.data.allowances;
    }
}