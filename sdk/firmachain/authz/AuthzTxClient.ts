import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { MsgExec, MsgGrant, MsgRevoke } from "./AuthzTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/cosmos.authz.v1beta1.MsgExec", MsgExec],
    ["/cosmos.authz.v1beta1.MsgGrant", MsgGrant],
    ["/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke],
];

const registry = new Registry(types as any);

export interface MsgExecAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgExec";
    readonly value: Partial<MsgExec>;
}

export interface MsgGrantAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgGrant";
    readonly value: Partial<MsgGrant>;
}

export interface MsgRevokeAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgRevoke";
    readonly value: Partial<MsgRevoke>;
}

export class AuthzTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgExecAllowance(data: MsgExec): MsgExecAllowanceEncodeObject {
        return { typeUrl: "/cosmos.authz.v1beta1.MsgExec", value: data };
    }

    static msgGrantAllowance(data: MsgGrant): MsgGrantAllowanceEncodeObject {
        return { typeUrl: "/cosmos.authz.v1beta1.MsgGrant", value: data };
    }

    static msgRevokeAllowance(data: MsgRevoke): MsgRevokeAllowanceEncodeObject {
        return { typeUrl: "/cosmos.authz.v1beta1.MsgRevoke", value: data };
    }
}