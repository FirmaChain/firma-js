import Axios, { AxiosInstance } from "axios";

export interface ClientState {
    identified_client_state: {
        client_id: string;
        client_state: {
            "@type": "string";
            chain_id: string;
            trust_level: {
                numerator: string;
                denominator: string;
            };
            trusting_period: string;
            unbonding_period: string;
            max_clock_drift: string;
            frozen_height: {
                revision_number: string;
                revision_height: string;
            };
            latest_height: {
                revision_number: string;
                revision_height: string;
            };
        }
    };
    proof: string;
    proof_height: {
        revision_number: string;
        revision_height: string;
    }
}

export class IbcQueryClient {
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

    async getClientState(sourceChannel: string, sourcePort: string): Promise<ClientState> {

        // curl -X GET "https://lcd-testnet.firmachain.dev:1317/ibc/core/channel/v1/channels/channel-3/ports/transfer/client_state" -H  "accept: application/json"

        const path = `/ibc/core/channel/v1/channels/${sourceChannel}/ports/${sourcePort}/client_state`;

        const result = await this.axios.get(path);
        return result.data;
    }
}