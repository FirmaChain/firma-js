import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";

import { MsgDeposit, MsgSubmitProposal, MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";

import { ITxClient } from "../common/ITxClient";

const types = [
  ["/cosmos.gov.v1beta1.MsgDeposit", MsgDeposit],
  ["/cosmos.gov.v1beta1.MsgSubmitProposal", MsgSubmitProposal],
  ["/cosmos.gov.v1beta1.MsgVote", MsgVote],
];

const registry = new Registry(<any>types);

interface MsgDepositEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.gov.v1beta1.MsgDeposit";
  readonly value: Partial<MsgDeposit>;
}

interface MsgSubmitProposalEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal";
  readonly value: Partial<MsgSubmitProposal>;
}

interface MsgVoteEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.gov.v1beta1.MsgVote";
  readonly value: Partial<MsgVote>;
}

export class GovTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgDeposit(data: MsgDeposit): MsgDepositEncodeObject {
    return { typeUrl: "/cosmos.gov.v1beta1.MsgDeposit", value: data };
  }

  public msgSubmitProposal(data: MsgSubmitProposal): MsgSubmitProposalEncodeObject {
    return { typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal", value: data };
  }

  public msgVote(data: MsgVote): MsgVoteEncodeObject {
    return { typeUrl: "/cosmos.gov.v1beta1.MsgVote", value: data };
  }
  
}