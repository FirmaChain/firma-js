import { Any } from "../google/protobuf/any";
import { BinaryWriter } from "cosmjs-types/binary";

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
    encode(message: MsgGrantAllowance, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
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
    encode(message: MsgRevokeAllowance, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
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

/** AllowedMsgAllowance creates allowance only for specified message types. */
export interface AllowedMsgAllowance {
    /** allowance can be any of basic and filtered fee allowance. */
    allowance: Any | undefined;
    /** allowed_messages are the messages for which the grantee has the access. */
    allowedMessages: string[];
}

export const AllowedMsgAllowance = {
    encode(message: AllowedMsgAllowance, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
        if (message.allowance !== undefined) {
            Any.encode(message.allowance, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.allowedMessages) {
            writer.uint32(18).string(v!);
        }
        return writer;
    },
};

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