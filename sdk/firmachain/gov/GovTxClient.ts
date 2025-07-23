import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import {
    MsgDeposit as V1MsgDeposit,
    MsgSubmitProposal as V1MsgSubmitProposal,
    MsgUpdateParams as V1MsgUpdateParams,
    MsgVote as V1MsgVote,
    MsgVoteWeighted as V1MsgVoteWeighted,
} from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/tx";
import { MsgDeposit, MsgSubmitProposal, MsgVote, MsgVoteWeighted } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgSubmitProposal as MsgSubmitGenericProposal } from "cosmjs-types/cosmos/gov/v1/tx";
// temporarly using kintsugi-tech/cosmjs-types - this will be returned to original cosmjs-types after the PR is merged
import { MsgCancelProposal as V1MsgCancelProposal } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/tx";

import { FirmaWalletService } from "../../FirmaWalletService";
import { ITxClient } from "../common/ITxClient";

const types = [
    ["/cosmos.gov.v1.MsgDeposit", V1MsgDeposit],
    ["/cosmos.gov.v1.MsgSubmitProposal", V1MsgSubmitProposal],
    ["/cosmos.gov.v1.MsgUpdateParams", V1MsgUpdateParams],
    ["/cosmos.gov.v1.MsgVote", V1MsgVote],
    ["/cosmos.gov.v1.MsgVoteWeighted", V1MsgVoteWeighted],
    ["/cosmos.gov.v1.MsgCancelProposal", V1MsgCancelProposal],

    ["/cosmos.gov.v1beta1.MsgDeposit", MsgDeposit],
    ["/cosmos.gov.v1beta1.MsgSubmitProposal", MsgSubmitProposal],
    ["/cosmos.gov.v1beta1.MsgVote", MsgVote],
    ["/cosmos.gov.v1beta1.MsgVoteWeighted", MsgVoteWeighted],
];

const registry = new Registry(types as any);

export interface V1MsgDepositEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgDeposit";
    readonly value: Partial<V1MsgDeposit>;
}

export interface V1MsgSubmitProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgSubmitProposal";
    readonly value: Partial<V1MsgSubmitProposal>;
}

export interface V1MsgUpdateParamsEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgUpdateParams";
    readonly value: Partial<V1MsgUpdateParams>;
}

export interface V1MsgVoteWeightedEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgVoteWeighted";
    readonly value: Partial<V1MsgVoteWeighted>;
}

export interface V1MsgCancelProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgCancelProposal";
    readonly value: Partial<V1MsgCancelProposal>;
}

export interface V1MsgVoteEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1.MsgVote";
    readonly value: Partial<V1MsgVote>;
}

export interface MsgDepositEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgDeposit";
    readonly value: Partial<MsgDeposit>;
}

export interface MsgSubmitProposalEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal";
    readonly value: Partial<MsgSubmitProposal>;
}

export interface MsgVoteEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgVote";
    readonly value: Partial<MsgVote>;
}

export interface MsgVoteWeightedEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.gov.v1beta1.MsgVoteWeighted";
    readonly value: Partial<MsgVoteWeighted>;
}

export class GovTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry(): Registry {
        return registry;
    }

    static v1MsgDeposit(data: V1MsgDeposit): V1MsgDepositEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgDeposit", value: data };
    }

    static v1MsgSubmitProposal(data: V1MsgSubmitProposal): V1MsgSubmitProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgSubmitProposal", value: data };
    }

    static v1MsgUpdateParams(data: V1MsgUpdateParams): V1MsgUpdateParamsEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgUpdateParams", value: data };
    }

    static v1MsgVote(data: V1MsgVote): V1MsgVoteEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgVote", value: data };
    }

    static v1MsgVoteWeighted(data: V1MsgVoteWeighted): V1MsgVoteWeightedEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgVoteWeighted", value: data };
    }

    static v1MsgCancelProposal(data: V1MsgCancelProposal): V1MsgCancelProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1.MsgCancelProposal", value: data };
    }

    static msgDeposit(data: MsgDeposit): MsgDepositEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgDeposit", value: data };
    }

    static msgSubmitProposal(data: MsgSubmitProposal): MsgSubmitProposalEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal", value: data };
    }

    static msgVote(data: MsgVote): MsgVoteEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgVote", value: data };
    }

    static msgVoteWeighted(data: MsgVoteWeighted): MsgVoteWeightedEncodeObject {
        return { typeUrl: "/cosmos.gov.v1beta1.MsgVoteWeighted", value: data };
    }
}