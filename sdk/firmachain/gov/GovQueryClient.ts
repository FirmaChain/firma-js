import Axios, { AxiosInstance } from "axios";

export enum ProposalStatus {
    PROPOSAL_STATUS_UNSPECIFIED = 0,
    PROPOSAL_STATUS_DEPOSIT_PERIOD = 1,
    PROPOSAL_STATUS_VOTING_PERIOD = 2,
    PROPOSAL_STATUS_PASSED = 3,
    PROPOSAL_STATUS_REJECTED = 4,
    PROPOSAL_STATUS_FAILED = 5,
}

export interface ProposalParam {
    voting_params: {
        voting_period: string;
    },
    deposit_params: {
        min_deposit: {
            denom: string,
            amount: string;
        }[],
        max_deposit_period: string;
    };
    tally_params: {
        quorum: string,
        threshold: string,
        veto_threshold: string,
    };
    min_initial_deposit_ratio: string;
    burn_vote_quorum: boolean;
    burn_proposal_deposit_prevote: boolean;
    burn_vote_veto: boolean;
    expedited_voting_period: string;
    expedited_threshold: string;
    expedited_min_deposit: {
        denom: string;
        amount: string;
    }[];
}

export interface CurrentVoteInfo {
    yes: string,
    abstain: string,
    no: string,
    no_with_veto: string;
}

export interface ProposalInfo {
    id: string;
    messages: {
        "@type": string,
        content: string,
        aythority: string;
    };
    status: string;
    final_tally_result: {
        yes_count: string,
        abstain_count: string,
        no_count: string,
        no_with_veto_count: string;
    };
    submit_time: string;
    deposit_end_time: string;
    total_deposit: {
        denom: string,
        amount: string;
    }[];
    voting_start_time: string;
    voting_end_time: string;
    metadata: string;
    title: string;
    summary: string;
    proposer: string;
    expedited: boolean;
    failed_reason: string;
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

    async queryGetParam(): Promise<ProposalParam> {

        let path = "/cosmos/gov/v1beta1/params/voting";
        const votingResult = await this.axios.get(path);

        path = "/cosmos/gov/v1beta1/params/deposit";
        const depositResult = await this.axios.get(path);

        path = "/cosmos/gov/v1beta1/params/tallying";
        const tallyingResult = await this.axios.get(path);

        return {
            voting_params: votingResult.data.voting_params,
            deposit_params: depositResult.data.deposit_params,
            tally_params: tallyingResult.data.tally_params,
            min_initial_deposit_ratio: votingResult.data.min_initial_deposit_ratio,
            burn_vote_quorum: votingResult.data.burn_vote_quorum,
            burn_proposal_deposit_prevote: votingResult.data.burn_proposal_deposit_prevote,
            burn_vote_veto: votingResult.data.burn_vote_veto,
            expedited_voting_period: votingResult.data.expedited_voting_period,
            expedited_threshold: votingResult.data.expedited_threshold,
            expedited_min_deposit: votingResult.data.expedited_min_deposit
        };
    }

    async queryGetProposal(id: string): Promise<ProposalInfo> {
        const path = `/cosmos/gov/v1/proposals/${id}`;

        const result = await this.axios.get(path);
        return result.data.proposal;
    }

    async queryGetProposalListByStatus(status: ProposalStatus): Promise<ProposalInfo[]> {
        const path = "/cosmos/gov/v1/proposals";

        const result = await this.axios.get(path, { params: { proposalStatus: status } });
        return result.data.proposals;
    }

    async queryGetProposalList(): Promise<ProposalInfo[]> {
        const path = "/cosmos/gov/v1/proposals";

        const result = await this.axios.get(path);
        return result.data.proposals;
    }
}