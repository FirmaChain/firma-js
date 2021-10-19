import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";

import {
    MsgBeginRedelegate,
    MsgCreateValidator,
    MsgDelegate,
    MsgEditValidator,
    MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";

import { ITxClient } from "../common/ITxClient";

const types = [
    ["/cosmos.staking.v1beta1.MsgDelegate", MsgDelegate],
    ["/cosmos.staking.v1beta1.MsgUndelegate", MsgUndelegate],
    ["/cosmos.staking.v1beta1.MsgBeginRedelegate", MsgBeginRedelegate],
    ["/cosmos.staking.v1beta1.MsgEditValidator", MsgEditValidator],
    ["/cosmos.staking.v1beta1.MsgCreateValidator", MsgCreateValidator],
];

const registry = new Registry(types as any);

export interface MsgDelegateEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgDelegate";
    readonly value: Partial<MsgDelegate>;
}

export interface MsgUndelegateEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate";
    readonly value: Partial<MsgUndelegate>;
}

export interface MsgRedelegateEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
    readonly value: Partial<MsgBeginRedelegate>;
}

export interface MsgEditValidatorEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator";
    readonly value: Partial<MsgEditValidator>;
}

export interface MsgCreateValidatorEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator";
    readonly value: Partial<MsgCreateValidator>;
}

export class StakingTxClient extends ITxClient {

    constructor(wallet: OfflineDirectSigner, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    msgDelegate(data: MsgDelegate): MsgDelegateEncodeObject {
        return { typeUrl: "/cosmos.staking.v1beta1.MsgDelegate", value: data };
    }

    msgUndelegate(data: MsgUndelegate): MsgUndelegateEncodeObject {
        return { typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate", value: data };
    }

    msgRedelegate(data: MsgBeginRedelegate): MsgRedelegateEncodeObject {
        return { typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate", value: data };
    }

    msgEditValidator(data: MsgEditValidator): MsgEditValidatorEncodeObject {
        return { typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator", value: data };
    }

    msgCreateValidator(data: MsgCreateValidator): MsgCreateValidatorEncodeObject {
        return { typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator", value: data };
    }
}