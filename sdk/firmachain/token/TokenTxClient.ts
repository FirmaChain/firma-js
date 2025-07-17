import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgUpdateTokenURI, MsgMint, MsgBurn, MsgCreateToken } from "./TokenTxTypes";
import { ITxClient } from "../common/ITxClient";
import { FirmaWalletService } from "../../FirmaWalletService";

const types = [
    ["/firmachain.token.MsgCreateToken", MsgCreateToken],
    ["/firmachain.token.MsgUpdateTokenURI", MsgUpdateTokenURI],
    ["/firmachain.token.MsgMint", MsgMint],
    ["/firmachain.token.MsgBurn", MsgBurn]
];

const registry = new Registry(types as any);

export interface MsgCreateTokenEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.token.MsgCreateToken";
    readonly value: Partial<MsgCreateToken>;
}

export interface MsgUpdateTokenURIEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.token.MsgUpdateTokenURI";
    readonly value: Partial<MsgUpdateTokenURI>;
}

export interface MsgMintEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.token.MsgMint";
    readonly value: Partial<MsgMint>;
}

export interface MsgBurnEncodeObject extends EncodeObject {
    readonly typeUrl: "/firmachain.token.MsgBurn";
    readonly value: Partial<MsgBurn>;
}

export class TokenTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, serverUrl: string) {
        super(wallet, serverUrl, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }

    static msgCreateToken(data: MsgCreateToken): MsgCreateTokenEncodeObject {
        return { typeUrl: "/firmachain.token.MsgCreateToken", value: data };
    }

    static msgUpdateTokenURI(data: MsgUpdateTokenURI): MsgUpdateTokenURIEncodeObject {
        return { typeUrl: "/firmachain.token.MsgUpdateTokenURI", value: data };
    }

    static msgMint(data: MsgMint): MsgMintEncodeObject {
        return { typeUrl: "/firmachain.token.MsgMint", value: data };
    }

    static msgBurn(data: MsgBurn): MsgBurnEncodeObject {
        return { typeUrl: "/firmachain.token.MsgBurn", value: data };
    }
}