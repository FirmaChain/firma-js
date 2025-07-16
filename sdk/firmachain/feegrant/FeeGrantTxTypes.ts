import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

import _m0 from "protobufjs/minimal";
import { Writer } from "protobufjs/minimal";

import { Timestamp } from "../google/protobuf/timestamp";
import { Any } from "../google/protobuf/any";
import { Duration } from "../google/protobuf/duration";

export interface MsgGrantAllowance {
    granter: string;
    grantee: string;
    allowance: Any | undefined;
}

export interface MsgRevokeAllowance {
    granter: string;
    grantee: string;
}

const baseMsgGrantAllowance: object = { granter: "", grantee: "" };
const baseMsgRevokeAllowance: object = { granter: "", grantee: "" };

export const MsgGrantAllowance = {
    encode(message: MsgGrantAllowance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.granter !== "") {
            writer.uint32(10).string(message.granter);
        }
        if (message.grantee !== "") {
            writer.uint32(18).string(message.grantee);
        }

        if (message.allowance !== undefined) {
            writer = Any.encode(message.allowance, writer.uint32(26).fork()).ldelim();
        }

        return writer;
    },

    fromPartial(object: DeepPartial<MsgGrantAllowance>): MsgGrantAllowance {
        const message = { ...baseMsgGrantAllowance } as MsgGrantAllowance;
        if (object.granter !== undefined && object.granter !== null) {
            message.granter = object.granter;
        } else {
            message.granter = "";
        }
        if (object.grantee !== undefined && object.grantee !== null) {
            message.grantee = object.grantee;
        } else {
            message.grantee = "";
        }

        if (object.allowance !== undefined && object.allowance !== null) {
            message.allowance = Any.fromPartial(object.allowance);
        } else {
            message.allowance = undefined;
        }

        return message;
    },
};


export const MsgRevokeAllowance = {
    encode(message: MsgRevokeAllowance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.granter !== "") {
            writer.uint32(10).string(message.granter);
        }
        if (message.grantee !== "") {
            writer.uint32(18).string(message.grantee);
        }

        return writer;
    },

    fromPartial(object: DeepPartial<MsgRevokeAllowance>): MsgRevokeAllowance {
        const message = { ...baseMsgRevokeAllowance } as MsgRevokeAllowance;
        if (object.granter !== undefined && object.granter !== null) {
            message.granter = object.granter;
        } else {
            message.granter = "";
        }
        if (object.grantee !== undefined && object.grantee !== null) {
            message.grantee = object.grantee;
        } else {
            message.grantee = "";
        }

        return message;
    },
};


export interface BasicAllowance {
    /**
     * spend_limit specifies the maximum amount of tokens that can be spent
     * by this allowance and will be updated as tokens are spent. If it is
     * empty, there is no spend limit and any amount of coins can be spent.
     */
    spendLimit: Coin[];
    /** expiration specifies an optional time when this allowance expires */
    expiration: Date | undefined;
}

export interface PeriodicAllowance {
    /** basic specifies a struct of `BasicAllowance` */
    basic: BasicAllowance | undefined;
    /**
     * period specifies the time duration in which period_spend_limit coins can
     * be spent before that allowance is reset
     */
    period: Duration | undefined;
    /**
     * period_spend_limit specifies the maximum number of coins that can be spent
     * in the period
     */
    periodSpendLimit: Coin[];
    /** period_can_spend is the number of coins left to be spent before the period_reset time */
    periodCanSpend: Coin[];
    /**
     * period_reset is the time at which this period resets and a new one begins,
     * it is calculated from the start time of the first transaction after the
     * last period ended
     */
    periodReset: Date | undefined;
}

/** AllowedMsgAllowance creates allowance only for specified message types. */
export interface AllowedMsgAllowance {
    /** allowance can be any of basic and filtered fee allowance. */
    allowance: Any | undefined;
    /** allowed_messages are the messages for which the grantee has the access. */
    allowedMessages: string[];
}

export const AllowedMsgAllowance = {
    encode(
    message: AllowedMsgAllowance,
    writer: Writer = Writer.create()
    ): Writer {
        if (message.allowance !== undefined) {
            Any.encode(message.allowance, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.allowedMessages) {
            writer.uint32(18).string(v!);
        }
        return writer;
    },
};

export const PeriodicAllowance = {
    encode(message: PeriodicAllowance, writer: Writer = Writer.create()): Writer {
        if (message.basic !== undefined) {
            BasicAllowance.encode(message.basic, writer.uint32(10).fork()).ldelim();
        }
        if (message.period !== undefined) {
            Duration.encode(message.period, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.periodSpendLimit) {
            Coin.encode(v!, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.periodCanSpend) {
            Coin.encode(v!, writer.uint32(34).fork()).ldelim();
        }
        if (message.periodReset !== undefined) {
            Timestamp.encode(
                toTimestamp(message.periodReset),
                writer.uint32(42).fork()
            ).ldelim();
        }
        return writer;
    },
};

export const BasicAllowance = {
    encode(message: BasicAllowance, writer: Writer = Writer.create()): Writer {
        for (const v of message.spendLimit) {
            Coin.encode(v!, writer.uint32(10).fork()).ldelim();
        }
        if (message.expiration !== undefined) {
            Timestamp.encode(
                toTimestamp(message.expiration),
                writer.uint32(18).fork()
            ).ldelim();
        }
        return writer;
    },
};

function toTimestamp(date: Date): Timestamp {
    const seconds = date.getTime() / 1_000;
    const nanos = (date.getTime() % 1_000) * 1_000_000;
    return { seconds, nanos };
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined | Long;
export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>;