import Axios, { AxiosInstance } from "axios";
import { Proposal } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/gov";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export enum ProposalStatus {
    PROPOSAL_STATUS_UNSPECIFIED = 0,
    PROPOSAL_STATUS_DEPOSIT_PERIOD = 1,
    PROPOSAL_STATUS_VOTING_PERIOD = 2,
    PROPOSAL_STATUS_PASSED = 3,
    PROPOSAL_STATUS_REJECTED = 4,
    PROPOSAL_STATUS_FAILED = 5,
}

export interface GovParamType {
    min_deposit: Coin[];
    max_deposit_period: string;
    voting_period: string;
    quorum: string;
    threshold: string;
    veto_threshold: string;
    min_initial_deposit_ratio: string;
    proposal_cancel_ratio: string;
    proposal_cancel_dest: string;
    expedited_voting_period: string;
    expedited_threshold: string;
    expedited_min_deposit: Coin[];
    burn_vote_quorum: boolean;
    burn_proposal_deposit_prevote: boolean;
    burn_vote_veto: boolean;
    min_deposit_ratio: string;
}

export interface CurrentVoteInfo {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
}

export class GovQueryClient {
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

    async queryGetCurrentVoteInfo(id: string): Promise<CurrentVoteInfo> {
        const path = `/cosmos/gov/v1beta1/proposals/${id}/tally`;

        const result = await this.axios.get(path);
        return result.data.tally;
    }

    async queryGetParam(): Promise<GovParamType> {

        let path = "/cosmos/gov/v1/params/deposit";
        const result = await this.axios.get(path);

        return result.data.params;
    }

    async queryGetProposal(id: string): Promise<Proposal> {
        const path = `/cosmos/gov/v1/proposals/${id}`;

        const result = await this.axios.get(path);
        return result.data.proposal;
    }

    async queryGetProposalListByStatus(status: ProposalStatus): Promise<Proposal[]> {
        const path = "/cosmos/gov/v1/proposals";

        const result = await this.axios.get(path, { params: { proposalStatus: status } });
        return result.data.proposals;
    }

    async queryGetProposalList(pagination?: { limit?: number; key?: string; }): Promise<Proposal[]> {
        const path = "/cosmos/gov/v1/proposals";

        const result = await this.axios.get(path, { params: { ...pagination } });
        return result.data.proposals;
    }
}