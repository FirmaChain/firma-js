import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgSubmitProposal as MsgSubmitGenericProposal } from "cosmjs-types/cosmos/gov/v1/tx";
// temporarly using kintsugi-tech/cosmjs-types - this will be returned to original cosmjs-types after the PR is merged
import { MsgCancelProposal } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/tx";

import { FirmaWalletService } from "../../FirmaWalletService";
import { ITxClient } from "../common/ITxClient";


const types = [
    ["/cosmos.gov.v1beta1.MsgDeposit", MsgDeposit],
    ["/cosmos.gov.v1beta1.MsgSubmitProposal", MsgSubmitProposal],
    ["/cosmos.gov.v1.MsgSubmitProposal", MsgSubmitGenericProposal],
    ["/cosmos.gov.v1beta1.MsgVote", MsgVote],
    ["/cosmos.gov.v1.MsgCancelProposal", MsgCancelProposal],
];

const registry = new Registry(types as any);

export interface MsgDepositEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgDeposit";
    readonly value: Partial<MsgDeposit>;
}

export interface MsgSubmitProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal";
    readonly value: Partial<MsgSubmitProposal>;
}

export interface MsgSubmitGenericProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgSubmitProposal";
    readonly value: Partial<MsgSubmitGenericProposal>;
}

export interface MsgVoteEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgVote";
    readonly value: Partial<MsgVote>;
}

export interface MsgCancelProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgCancelProposal";
    readonly value: Partial<MsgCancelProposal>;
}

export class GovTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgDeposit(data: MsgDeposit): MsgDepositEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgDeposit", value: data };
    }

    static msgSubmitProposal(data: MsgSubmitProposal): MsgSubmitProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal", value: data };
    }

    static msgSubmitGenericProposal(data: MsgSubmitGenericProposal): MsgSubmitGenericProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgSubmitProposal", value: data };
    }
    
    static msgVote(data: MsgVote): MsgVoteEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgVote", value: data };
    }

    static msgCancelProposal(data: MsgCancelProposal): MsgCancelProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgCancelProposal", value: data };
    }
}