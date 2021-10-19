import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgTransfer, MsgMint, MsgBurn } from "./NftTxTypes";
import { ITxClient } from "../common/ITxClient";

const types = [
    ["/firmachain.firmachain.nft.MsgTransfer", MsgTransfer],
    ["/firmachain.firmachain.nft.MsgMint", MsgMint],
    ["/firmachain.firmachain.nft.MsgBurn", MsgBurn]
];

const registry = new Registry(types as any);

export interface MsgTransferEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgTransfer";
    readonly value: Partial<MsgTransfer>;
}

export interface MsgMintEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgMint";
    readonly value: Partial<MsgMint>;
}

export interface MsgBurnEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgBurn";
    readonly value: Partial<MsgBurn>;
}

export class NftTxClient extends ITxClient {

    constructor(wallet: OfflineDirectSigner, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    msgTransfer(data: MsgTransfer): MsgTransferEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgTransfer", value: data };
    }

    msgMint(data: MsgMint): MsgMintEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgMint", value: data };
    }

    msgBurn(data: MsgBurn): MsgBurnEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgBurn", value: data };
    }
}