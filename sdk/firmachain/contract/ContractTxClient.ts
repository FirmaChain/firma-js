import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { MsgCreateContractFile, MsgAddContractLog } from "./ContractTxTypes";
import { ITxClient } from "../common/ITxClient";

const types = [
    ["/firmachain.firmachain.contract.MsgCreateContractFile", MsgCreateContractFile],
    ["/firmachain.firmachain.contract.MsgAddContractLog", MsgAddContractLog]
];

const registry = new Registry(types as any);

export interface MsgAddContractLogEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.contract.MsgAddContractLog";
    readonly value: Partial<MsgAddContractLog>;
}

export interface MsgCreateContractFileEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.contract.MsgCreateContractFile";
    readonly value: Partial<MsgCreateContractFile>;
}

export class ContractTxClient extends ITxClient {

    constructor(wallet: OfflineDirectSigner, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    msgAddContractLog(data: MsgAddContractLog): MsgAddContractLogEncodeObject {
        return { typeUrl: "/firmachain.firmachain.contract.MsgAddContractLog", value: data };
    }

    msgCreateContractFile(data: MsgCreateContractFile): MsgCreateContractFileEncodeObject {
        return { typeUrl: "/firmachain.firmachain.contract.MsgCreateContractFile", value: data };
    }
}