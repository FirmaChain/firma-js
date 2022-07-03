import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

import {
    MsgClearAdmin,
    MsgExecuteContract,
    MsgMigrateContract,
    MsgStoreCode,
    MsgInstantiateContract,
    MsgUpdateAdmin

} from "cosmjs-types/cosmwasm/wasm/v1/tx";

const types = [
    ["/cosmwasm.wasm.v1.MsgStoreCode", MsgStoreCode],
    ["/cosmwasm.wasm.v1.MsgInstantiateContract", MsgInstantiateContract],
    ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract],

    ["/cosmwasm.wasm.v1.MsgUpdateAdmin", MsgUpdateAdmin],
    ["/cosmwasm.wasm.v1.MsgClearAdmin", MsgClearAdmin],
    ["/cosmwasm.wasm.v1.MsgMigrateContract", MsgMigrateContract],
];

const registry = new Registry(types as any);

export interface MsgStoreCodeEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode";
    readonly value: Partial<MsgStoreCode>;
}

export interface MsgInstantiateContractEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract";
    readonly value: Partial<MsgInstantiateContract>;
}

export interface MsgUpdateAdminEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin";
    readonly value: Partial<MsgUpdateAdmin>;
}

export interface MsgClearAdminEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgClearAdmin";
    readonly value: Partial<MsgClearAdmin>;
}

export interface MsgMigrateContractEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgMigrateContract";
    readonly value: Partial<MsgMigrateContract>;
}

export interface MsgExecuteContractEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract";
    readonly value: Partial<MsgExecuteContract>;
}

export class CosmWasmTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgStoreCode(data: MsgStoreCode): MsgStoreCodeEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode", value: data };
    }

    static msgInstantiateContract(data: MsgInstantiateContract): MsgInstantiateContractEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract", value: data };
    }

    static msgExecuteContract(data: MsgExecuteContract): MsgExecuteContractEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: data };
    }

    static msgUpdateAdmin(data: MsgUpdateAdmin): MsgUpdateAdminEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin", value: data };
    }

    static msgClearAdmin(data: MsgClearAdmin): MsgClearAdminEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgClearAdmin", value: data };
    }

    static msgMigrateContract(data: MsgMigrateContract): MsgMigrateContractEncodeObject {
        return { typeUrl: "/cosmwasm.wasm.v1.MsgMigrateContract", value: data };
    }
}