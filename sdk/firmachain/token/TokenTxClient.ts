import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgUpdateTokenURI, MsgMint, MsgBurn, MsgCreateToken } from "./TokenTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/firmachain.firmachain.token.MsgCreateToken", MsgCreateToken],
    ["/firmachain.firmachain.token.MsgUpdateTokenURI", MsgUpdateTokenURI],
    ["/firmachain.firmachain.token.MsgMint", MsgMint],
    ["/firmachain.firmachain.token.MsgBurn", MsgBurn]
];

const registry = new Registry(types as any);

export interface MsgCreateTokenEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.token.MsgCreateToken";
    readonly value: Partial<MsgCreateToken>;
}

export interface MsgUpdateTokenURIEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.token.MsgUpdateTokenURI";
    readonly value: Partial<MsgUpdateTokenURI>;
}

export interface MsgMintEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.token.MsgMint";
    readonly value: Partial<MsgMint>;
}

export interface MsgBurnEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.firmachain.token.MsgBurn";
    readonly value: Partial<MsgBurn>;
}

export class TokenTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    msgCreateToken(data: MsgCreateToken): MsgCreateTokenEncodeObject {
        return { typeUrl: "/firmachain.firmachain.token.MsgCreateToken", value: data };
    }

    msgUpdateTokenURI(data: MsgUpdateTokenURI): MsgUpdateTokenURIEncodeObject {
        return { typeUrl: "/firmachain.firmachain.token.MsgUpdateTokenURI", value: data };
    }

    msgMint(data: MsgMint): MsgMintEncodeObject {
        return { typeUrl: "/firmachain.firmachain.token.MsgMint", value: data };
    }

    msgBurn(data: MsgBurn): MsgBurnEncodeObject {
        return { typeUrl: "/firmachain.firmachain.token.MsgBurn", value: data };
    }
}