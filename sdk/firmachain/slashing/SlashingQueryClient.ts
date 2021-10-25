import Axios, { AxiosInstance } from "axios";


export interface SlashingParam {
    signed_blocks_window: string;
    min_signed_per_window: string;
    downtime_jail_duration: string;
    slash_fraction_double_sign: string;
    slash_fraction_downtime: string;
}

export interface SigningInfo {
    address: string;
    start_height: string;
    index_offset: string;
    jailed_until: string;
    tombstoned: boolean;
    missed_blocks_counter: string;
}

export class SlashingQueryClient {
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

    async queryGetSlashingParam(): Promise<SlashingParam> {

        const path = "/cosmos/slashing/v1beta1/params";
        const result = await this.axios.get(path);

        return result.data.params;
    }

    async queryGetSigningInfo(consAddress: string): Promise<SigningInfo> {

        const path = "/cosmos/slashing/v1beta1/signing_infos/" + consAddress;
        const result = await this.axios.get(path);

        return result.data.val_signing_info;
    }

    async queryGetSigningInfos(): Promise<SigningInfo[]> {

        const path = "/cosmos/slashing/v1beta1/signing_infos";
        const result = await this.axios.get(path);

        return result.data.info;
    }
}