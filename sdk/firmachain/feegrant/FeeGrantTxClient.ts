import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgGrantAllowance, MsgRevokeAllowance } from "./FeeGrantTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", MsgGrantAllowance],
    ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", MsgRevokeAllowance]
];

const registry = new Registry(types as any);

export interface MsgGrantAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance";
    readonly value: Partial<MsgGrantAllowance>;
}

export interface MsgRevokeAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance";
    readonly value: Partial<MsgRevokeAllowance>;
}

export class FeeGrantTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgGrantAllowance(data: MsgGrantAllowance): MsgGrantAllowanceEncodeObject {
        return { typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance", value: data };
    }

    static msgRevokeAllowance(data: MsgRevokeAllowance): MsgRevokeAllowanceEncodeObject {
        return { typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance", value: data };
    }
}