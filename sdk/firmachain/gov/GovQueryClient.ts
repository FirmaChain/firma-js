import Axios, { AxiosInstance } from 'axios';

export enum ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = 0,
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 1,
  PROPOSAL_STATUS_VOTING_PERIOD = 2,
  PROPOSAL_STATUS_PASSED = 3,
  PROPOSAL_STATUS_REJECTED = 4,
  PROPOSAL_STATUS_FAILED = 5,
}

export interface ProposalParam {
  voting_period: string;
  deposit_params: {
    min_deposit: {
      denom: string,
      amount: string
    }[],
    max_deposit_period: string
  };
  tally_params: {
    quorum: string,
    threshold: string,
    veto_threshold: string,
  };
}

export interface ProposalInfo {
  proposal_id: string;
  content: {
    "@type": string,
    title: string,
    description: string
  };
  status: string;
  final_tally_result: {
    yes: string,
    abstain: string,
    no: string,
    no_with_veto: string
  };
  submit_time: string;
  deposit_end_time: string;
  total_deposit: {
    denom: string,
    amount: string
  }[];
  voting_start_time: string;
  voting_end_time: string;
}

export class GovQueryClient {
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

  public async queryGetParam(): Promise<ProposalParam> {

    let path = "/cosmos/gov/v1beta1/params/voting";
    var votingResult = await this._axios.get(path);

    path = "/cosmos/gov/v1beta1/params/deposit";
    var depositResult = await this._axios.get(path);

    path = "/cosmos/gov/v1beta1/params/tallying";
    var tallyingResult = await this._axios.get(path);

    return {
      voting_period: votingResult.data.voting_params.voting_period,
      deposit_params: depositResult.data.deposit_params,
      tally_params: tallyingResult.data.tally_params
    };
  }

  public async queryGetProposal(id: string): Promise<ProposalInfo> {
    let path = "/cosmos/gov/v1beta1/proposals/" + id;

    var result = await this._axios.get(path);
    return result.data.proposal;
  }

  public async queryGetProposalListByStatus(status: ProposalStatus): Promise<ProposalInfo[]> {
    let path = "/cosmos/gov/v1beta1/proposals";

    var result = await this._axios.get(path, { params: { proposalStatus: status } });
    return result.data.proposals;
  }

  public async queryGetProposalList(): Promise<ProposalInfo[]> {
    let path = "/cosmos/gov/v1beta1/proposals";

    var result = await this._axios.get(path);
    return result.data.proposals;
  }
}