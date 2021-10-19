import { Pubkey } from "@cosmjs/amino";
import { Uint64 } from "@cosmjs/math";
import { decodePubkey } from "@cosmjs/proto-signing";
import { BaseAccount, ModuleAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import {
    BaseVestingAccount,
    ContinuousVestingAccount,
    DelayedVestingAccount,
    PeriodicVestingAccount,
} from "cosmjs-types/cosmos/vesting/v1beta1/vesting";
import { Any } from "../google/protobuf/any";
import Long from "long";

export interface Account {
    /** Bech32 account address */
    readonly address: string;
    readonly pubkey: Pubkey | null;
    readonly accountNumber: number;
    readonly sequence: number;
}

function uint64FromProto(input: number | Long): Uint64 {
    return Uint64.fromString(input.toString());
}

function accountFromBaseAccount(input: BaseAccount): Account {
    const { address, pubKey, accountNumber, sequence } = input;
    const pubkey = decodePubkey(pubKey);
    return {
        address: address,
        pubkey: pubkey,
        accountNumber: uint64FromProto(accountNumber).toNumber(),
        sequence: uint64FromProto(sequence).toNumber(),
    };
}

/**
 * Takes an `Any` encoded account from the chain and extracts some common
 * `Account` information from it. This is supposed to support the most relevant
 * common Cosmos SDK account types. If you need support for exotic account types,
 * you'll need to write your own account decoder.
 */
export function accountFromAny(input: Any): Account {
    const { typeUrl, value } = input;

    switch (typeUrl) {
        // auth
    case "/cosmos.auth.v1beta1.BaseAccount":
        return accountFromBaseAccount(BaseAccount.decode(value));
    case "/cosmos.auth.v1beta1.ModuleAccount":
    {
        const baseAccount = ModuleAccount.decode(value).baseAccount;
        return accountFromBaseAccount(baseAccount!);
    }

    // vesting
    case "/cosmos.vesting.v1beta1.BaseVestingAccount":
    {
        const baseAccount = BaseVestingAccount.decode(value)?.baseAccount;
        return accountFromBaseAccount(baseAccount!);
    }
    case "/cosmos.vesting.v1beta1.ContinuousVestingAccount":
    {
        const baseAccount = ContinuousVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
        return accountFromBaseAccount(baseAccount!);
    }
    case "/cosmos.vesting.v1beta1.DelayedVestingAccount":
    {
        const baseAccount = DelayedVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
        return accountFromBaseAccount(baseAccount!);
    }
    case "/cosmos.vesting.v1beta1.PeriodicVestingAccount":
    {
        const baseAccount = PeriodicVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
        return accountFromBaseAccount(baseAccount!);
    }

    default:
        throw new Error(`Unsupported type: '${typeUrl}'`);
    }
}