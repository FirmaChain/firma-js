import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";

import {
    MsgFundCommunityPool,
    MsgSetWithdrawAddress,
    MsgWithdrawDelegatorReward,
    MsgWithdrawValidatorCommission,
} from "cosmjs-types/cosmos/distribution/v1beta1/tx";

import { ITxClient } from "../common/ITxClient";

const types = [
    ["/cosmos.distribution.v1beta1.MsgFundCommunityPool", MsgFundCommunityPool],
    ["/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", MsgSetWithdrawAddress],
    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", MsgWithdrawDelegatorReward],
    ["/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission]
];

const registry = new Registry(types as any);

export interface MsgFundCommunityPoolEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool";
    readonly value: Partial<MsgFundCommunityPool>;
}

export interface MsgSetWithdrawAddressEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress";
    readonly value: Partial<MsgSetWithdrawAddress>;
}

export interface MsgWithdrawDelegatorRewardEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
    readonly value: Partial<MsgWithdrawDelegatorReward>;
}

export interface MsgWithdrawValidatorCommissionEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission";
    readonly value: Partial<MsgWithdrawValidatorCommission>;
}

export class DistributionTxClient extends ITxClient {

    constructor(wallet: OfflineDirectSigner, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    msgFundCommunityPool(data: MsgFundCommunityPool): MsgFundCommunityPoolEncodeObject {
        return { typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool", value: data };
    }

    msgSetWithdrawAddress(data: MsgSetWithdrawAddress): MsgSetWithdrawAddressEncodeObject {
        return { typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", value: data };
    }

    msgWithdrawDelegatorReward(data: MsgWithdrawDelegatorReward): MsgWithdrawDelegatorRewardEncodeObject {
        return { typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", value: data };
    }

    msgWithdrawValidatorCommission(data: MsgWithdrawValidatorCommission): MsgWithdrawValidatorCommissionEncodeObject {
        return { typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", value: data };
    }

}