import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";
import { CosmWasmTxClient } from "./firmachain/cosmwasm/CosmWasmTxClient";
import { EncodeObject } from "@cosmjs/proto-signing";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export interface Cw721ExpiresAtHeight {
    at_height: number;
}

export interface Cw721ExpiresAtTime {
    at_time: string; // Unix timestamp nano seconds
}

export interface Cw721ExpiresNever {
    never: {};
}

export type Cw721Expires = Cw721ExpiresAtHeight | Cw721ExpiresAtTime | Cw721ExpiresNever;

interface OwnershipResponse {
    owner: string | null;
    pending_owner: string | null;
    pending_expiry: Cw721Expires | null;
}

export interface Cw721NftInfo {
    access: {
        owner: string;
        approvals: Cw721Approval[];
    }

    info: {
        token_uri: string;
        extension: Object;
    }
}

export interface Cw721ContractInfo {
    name: string;
    symbol: string;
}

export interface Cw721Approval {
    spender: string,
    expires: Cw721Expires;
}

// staic util
const noFunds: any = [];

export class Cw721MsgData {

    static getMsgDataMint(owner: string, token_id: string, token_uri: string) {
        return JSON.stringify({
            "mint": {
                token_id,
                owner,
                extension: {},
                token_uri
            }
        });
    }
    
    static getMsgDataBurn(token_id: string) {
        return JSON.stringify({
            "burn": {
                token_id
            }
        });
    }
    
    static getMsgDataTransfer(recipient: string, token_id: string) {
        return JSON.stringify({
            "transfer_nft": {
                recipient,
                token_id
            }
        });
    }
    
    static getMsgDataApprove(spender: string, token_id: string, expires: Cw721Expires) {
        return JSON.stringify({
            "approve": {
                spender,
                token_id,
                expires
            }
        });
    }
    
    static getMsgDataRevoke(spender: string, token_id: string) {
        return JSON.stringify({
            "revoke": {
                spender,
                token_id
            }
        });
    }
    
    static getMsgDataApproveAll(operator: string, expires: Cw721Expires) {
        return JSON.stringify({
            "approve_all": {
                operator,
                expires
            }
        });
    }
    
    static getMsgDataRevokeAll(operator: string) {
        return JSON.stringify({
            "revoke_all": {
                operator
            }
        });
    }
    
    static getMsgDataSendNft(contract: string, token_id: string, msg: any) {
        return JSON.stringify({
            "send_nft": {
                contract,
                token_id,
                msg: btoa(JSON.stringify(msg))
            }
        });
    }
    
    static getMsgUpdateOwnerShipTransfer(new_owner: string, expiry: Cw721Expires) {
        return JSON.stringify({
            "update_ownership": {
                "transfer_ownership": {
                    new_owner,
                    expiry
                }
            }
        });
    }
    
    static getMsgUpdateOwnerShipAccept() {
        return JSON.stringify({
            "update_ownership": "accept_ownership"
        });
    }
    
    static getMsgUpdateOwnerShipRenounce() {
        return JSON.stringify({
            "update_ownership": "renounce_ownership"
        });
    }
}


export class FirmaCosmWasmCw721Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }
    
    // tx
    async mint(wallet: FirmaWalletService, contractAddress: string, owner: string, token_id: string, token_uri: string = "", txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataMint(owner, token_id, token_uri);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxMint(wallet: FirmaWalletService, contractAddress: string, owner: string, token_id: string, token_uri: string = "") {
        const msgData = Cw721MsgData.getMsgDataMint(owner, token_id, token_uri);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async burn(wallet: FirmaWalletService, contractAddress: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataBurn(token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxBurn(wallet: FirmaWalletService, contractAddress: string, token_id: string) {
        const msgData = Cw721MsgData.getMsgDataBurn(token_id);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async transfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataTransfer(recipient, token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, token_id: string) {
        const msgData = Cw721MsgData.getMsgDataTransfer(recipient, token_id);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async approve(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, expires: Cw721Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataApprove(spender, token_id, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxApprove(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, expires: Cw721Expires) {
        const msgData = Cw721MsgData.getMsgDataApprove(spender, token_id, expires);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async revoke(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataRevoke(spender, token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxRevoke(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string) {
        const msgData = Cw721MsgData.getMsgDataRevoke(spender, token_id);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async approveAll(wallet: FirmaWalletService, contractAddress: string, operator: string, expires: Cw721Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataApproveAll(operator, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxApproveAll(wallet: FirmaWalletService, contractAddress: string, operator: string, expires: Cw721Expires) {
        const msgData = Cw721MsgData.getMsgDataApproveAll(operator, expires);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async revokeAll(wallet: FirmaWalletService, contractAddress: string, operator: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataRevokeAll(operator);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxRevokeAll(wallet: FirmaWalletService, contractAddress: string, operator: string) {
        const msgData = Cw721MsgData.getMsgDataRevokeAll(operator);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async sendNft(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, token_id: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgDataSendNft(targetContractAddress, token_id, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxSendNft(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, token_id: string, msg: any) {
        const msgData = Cw721MsgData.getMsgDataSendNft(targetContractAddress, token_id, msg);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async updateOwnerShipTransfer(wallet: FirmaWalletService, contractAddress: string, new_owner: string, expiry: Cw721Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipTransfer(new_owner, expiry);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUpdateOwnerShipTransfer(wallet: FirmaWalletService, contractAddress: string, new_owner: string, expiry: Cw721Expires) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipTransfer(new_owner, expiry);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async updateOwnerShipAccept(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipAccept();
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUpdateOwnerShipAccept(wallet: FirmaWalletService, contractAddress: string) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipAccept();
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async updateOwnerShipRenounce(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipRenounce();
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUpdateOwnerShipRenounce(wallet: FirmaWalletService, contractAddress: string) {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipRenounce();
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async signAndBroadcast(wallet: FirmaWalletService, msgList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.signAndBroadcast(msgList,
                getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSignAndBroadcast(wallet: FirmaWalletService,
        msgList: EncodeObject[],
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);

            const txRaw = await txClient.sign(msgList, getSignAndBroadcastOption(this.config.denom, txMisc));
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // gas
    async getGasEstimationMint(wallet: FirmaWalletService, contractAddress: string, owner: string, token_id: string, token_uri: string = ""): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataMint(owner, token_id, token_uri);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, contractAddress: string, token_id: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataBurn(token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, token_id: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataTransfer(recipient, token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationApprove(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, expires: Cw721Expires): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataApprove(spender, token_id, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRevoke(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataRevoke(spender, token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationApproveAll(wallet: FirmaWalletService, contractAddress: string, operator: string, expires: Cw721Expires): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataApproveAll(operator, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRevokeAll(wallet: FirmaWalletService, contractAddress: string, operator: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataRevokeAll(operator);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSendNft(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, token_id: string, msg: any): Promise<number> {
        const msgData = Cw721MsgData.getMsgDataSendNft(targetContractAddress, token_id, msg);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipTransfer(wallet: FirmaWalletService, contractAddress: string, new_owner: string, expiry: Cw721Expires): Promise<number> {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipTransfer(new_owner, expiry);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipAccept(wallet: FirmaWalletService, contractAddress: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipAccept();
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipRenounce(wallet: FirmaWalletService, contractAddress: string): Promise<number> {
        const msgData = Cw721MsgData.getMsgUpdateOwnerShipRenounce();
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    // query
    async getOwnerFromNftID(contractAddress: string, tokenId: string): Promise<string> {
        try {

            const query = `{"owner_of": { "token_id": "${tokenId}" }}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.owner;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getApproval(contractAddress: string, tokenId: string, spender: string, isIncludeExpired: boolean = false): Promise<Cw721Approval> {
        try {

            const query = `{"approval": { "token_id": "${tokenId}", "spender" : "${spender}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approval;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getApprovals(contractAddress: string, tokenId: string, isIncludeExpired: boolean = false): Promise<Cw721Approval[]> {
        try {

            const query = `{"approvals": { "token_id": "${tokenId}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approvals;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllOperators(contractAddress: string, owner: string, isIncludeExpired: boolean = false, limit: number = 10, start_after: string | null = null): Promise<Cw721Approval[]> {
        try {

            const query = `{"all_operators": { "owner": "${owner}", "include_expired" : ${isIncludeExpired}, "limit": ${limit}, "start_after": "${start_after}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.operators;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getOperator(contractAddress: string, owner: string, operator: string, isIncludeExpired: boolean = false): Promise<Cw721Approval> {
        try {

            const query = `{"operator": { "owner": "${owner}", "operator": "${operator}" ,"include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approval;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalNfts(contractAddress: string): Promise<number> {
        try {

            const query = `{"num_tokens": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.count;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractInfo(contractAddress: string): Promise<Cw721ContractInfo> {
        try {

            const query = `{"contract_info": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftTokenUri(contractAddress: string, tokenId: string): Promise<string> {
        try {

            const query = `{"nft_info": { "token_id": "${tokenId}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.token_uri;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftData(contractAddress: string, tokenId: string): Promise<Cw721NftInfo> {
        try {
            const query = `{"all_nft_info": { "token_id": "${tokenId}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNFTIdListOfOwner(contractAddress: string, owner: string, limit: number = 10, start_after: string | null = null): Promise<string[]> {
        try {

            const query = `{"tokens": { "owner": "${owner}", "limit": ${limit}, "start_after": "${start_after}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
    
    async getAllNftIdList(contractAddress: string, limit: number = 10, start_after: string | null = null): Promise<string[]> {
        try {
            
            const query = `{"all_tokens": { "limit": ${limit}, "start_after": "${start_after}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMinter(contractAddress: string): Promise<string> {
        try {

            const query = `{"minter": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.minter;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getExtension(contractAddress: string) {
        try {

            const query = `{"extension": { "msg": {} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getOwnerShip(contractAddress: string): Promise<OwnershipResponse> {
        try {
            const query = `{"ownership": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}