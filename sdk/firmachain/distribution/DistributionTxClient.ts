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
  ["/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission],
];

const registry = new Registry(<any>types);

interface MsgFundCommunityPoolEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool";
  readonly value: Partial<MsgFundCommunityPool>;
}

interface MsgSetWithdrawAddressEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress";
  readonly value: Partial<MsgSetWithdrawAddress>;
}

interface MsgWithdrawDelegatorRewardEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
  readonly value: Partial<MsgWithdrawDelegatorReward>;
}

interface MsgWithdrawValidatorCommissionEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission";
  readonly value: Partial<MsgWithdrawValidatorCommission>;
}

export class DistributionTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgFundCommunityPool(data: MsgFundCommunityPool): MsgFundCommunityPoolEncodeObject {
    return { typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool", value: data };
  }

  public msgSetWithdrawAddress(data: MsgSetWithdrawAddress): MsgSetWithdrawAddressEncodeObject {
    return { typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", value: data };
  }

  public msgWithdrawDelegatorReward(data: MsgWithdrawDelegatorReward): MsgWithdrawDelegatorRewardEncodeObject {
    return { typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", value: data };
  }

  public msgWithdrawValidatorCommission(data: MsgWithdrawValidatorCommission): MsgWithdrawValidatorCommissionEncodeObject {
    return { typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", value: data };
  }
  
}