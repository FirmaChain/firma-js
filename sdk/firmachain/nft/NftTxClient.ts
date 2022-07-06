import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgTransfer, MsgMint, MsgBurn } from "./NftTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/firmachain.firmachain.nft.MsgTransfer", MsgTransfer],
    ["/firmachain.firmachain.nft.MsgMint", MsgMint],
    ["/firmachain.firmachain.nft.MsgBurn", MsgBurn]
];

const registry = new Registry(types as any);

export interface MsgNftTransferEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgTransfer";
    readonly value: Partial<MsgTransfer>;
}

export interface MsgNftMintEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgMint";
    readonly value: Partial<MsgMint>;
}

export interface MsgNftBurnEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.nft.MsgBurn";
    readonly value: Partial<MsgBurn>;
}

export class NftTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgTransfer(data: MsgTransfer): MsgNftTransferEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgTransfer", value: data };
    }

    static msgMint(data: MsgMint): MsgNftMintEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgMint", value: data };
    }

    static msgBurn(data: MsgBurn): MsgNftBurnEncodeObject {
        return { typeUrl: "/firmachain.firmachain.nft.MsgBurn", value: data };
    }
}