import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { FirmaWalletService } from "../../FirmaWalletService";
import { ITxClient } from "../common/ITxClient";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

const types = [
    ["/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer],
];

const registry = new Registry(types as any);

export interface MsgTransferEncodeObject extends EncodeObject {
    readonly typeUrl: "/ibc.applications.transfer.v1.MsgTransfer";
    readonly value: Partial<MsgTransfer>;
}

export class IbcTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, address: string) {
        super(wallet, address, registry);
    }

    msgTransfer(data: MsgTransfer): MsgTransferEncodeObject {
        return { typeUrl: "/ibc.applications.transfer.v1.MsgTransfer", value: data };
    }
}