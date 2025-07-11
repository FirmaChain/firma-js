import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { MsgCreateContractFile, MsgAddContractLog } from "./ContractTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/firmachain.contract.MsgCreateContractFile", MsgCreateContractFile],
    ["/firmachain.contract.MsgAddContractLog", MsgAddContractLog]
];

const registry = new Registry(types as any);

export interface MsgAddContractLogEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.contract.MsgAddContractLog";
    readonly value: Partial<MsgAddContractLog>;
}

export interface MsgCreateContractFileEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.contract.MsgCreateContractFile";
    readonly value: Partial<MsgCreateContractFile>;
}

export class ContractTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgAddContractLog(data: MsgAddContractLog): MsgAddContractLogEncodeObject {
        return { typeUrl: "/firmachain.contract.MsgAddContractLog", value: data };
    }

    static msgCreateContractFile(data: MsgCreateContractFile): MsgCreateContractFileEncodeObject {
        return { typeUrl: "/firmachain.contract.MsgCreateContractFile", value: data };
    }
}