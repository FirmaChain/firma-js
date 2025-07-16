import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Any } from "../google/protobuf/any";

export interface StdFee {
    amount: Coin[];
    gas: string;
    granter: string;
}

export interface BasicFeeGrantOption {
    spendLimit?: number,
    expiration?: Date,
}

export interface PeriodicFeeGrantOption {
    basicSpendLimit?: number,
    basicExpiration?: Date,
    periodSeconds: number,
    periodSpendLimit: number,
    periodCanSpend: number,
    periodReset: Date;
}

export const DefaultBasicFeeGrantOption = { spendLimit: undefined, expiration: undefined };

export interface TxMisc {
    memo?: string,
    fee?: number,
    gas?: number,
    feeGranter?: string;
}

export interface SignAndBroadcastOptions {
    fee: StdFee,
    memo: string;
}

export interface MsgCreateValidator {
    description?: Description;
    commission?: CommissionRates;
    minSelfDelegation: string;
    delegatorAddress: string;
    validatorAddress: string;
    value: Number;
}

export interface CommissionRates {
    /** rate is the commission rate charged to delegators, as a fraction. */
    rate: string;
    /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
    maxRate: string;
    /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
    maxChangeRate: string;
}

export interface Description {
    /** moniker defines a human-readable name for the validator. */
    moniker: string;
    /** identity defines an optional identity signature (ex. UPort or Keybase). */
    identity: string;
    /** website defines an optional website link. */
    website: string;
    /** security_contact defines an optional email for security contact. */
    securityContact: string;
    /** details define other optional details. */
    details: string;
}

export enum VotingOption {
    /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote option. */
    VOTE_OPTION_UNSPECIFIED = 0,
    /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote option. */
    VOTE_OPTION_YES = 1,
    /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote option. */
    VOTE_OPTION_ABSTAIN = 2,
    /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote option. */
    VOTE_OPTION_NO = 3,
    /** VOTE_OPTION_NO_WITH_VETO - VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option. */
    VOTE_OPTION_NO_WITH_VETO = 4,
    UNRECOGNIZED = -1
}

export interface ParamChangeOption {
    subspace: string;
    key: string;
    value: string;
}

export interface SoftwareUpgradePlan {
    name: string;
    time?: Date;
    height?: Long;
    info?: string,
    upgradedClientState?: Any;
}