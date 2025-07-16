import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";
import { CosmWasmTxClient } from "./firmachain/cosmwasm/CosmWasmTxClient";
import { EncodeObject } from "@cosmjs/proto-signing";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { FirmaCosmWasmCw721Service } from "./FirmaCosmWasmCw721";

export interface BridgeGlobalTxCounts {
    lock_count: number;
    unlock_count: number;
    deposit_count: number;
    withdraw_count: number;
}

export interface BridgeConfig {
    owner: string;
    cw721_address: string;
}

export interface NftInfo {
    owner: string,
    token_id: string,
    is_deposit: boolean,
}

// staic util
const noFunds: any = [];

export class CwBridgeMsgData {

    static getMsgDataChangeOwner(new_owner: string) {
        return JSON.stringify({
            "change_owner": {
                new_owner,
            }
        });
    }

    static getMsgDataAddAuthorizedUser(user: string) {
        return JSON.stringify({
            "add_authorized_user": {
                user,
            }
        });
    }

    static getMsgDataRemoveAuthorizedUser(user: string) {
        return JSON.stringify({
            "remove_authorized_user": {
                user,
            }
        });
    }

    static getMsgDataLock() {
        return {
			action: "lock",
			target_addr: ""
		}
    }

    static getMsgDataDeposit(toAddress: string) {
        return {
			action: "deposit",
			target_addr : toAddress
		}
    }

    static getMsgDataUnlock(token_id: string) {
        return JSON.stringify({
            "unlock": {
                token_id,
            }
        });
    }

    static getMsgDataWithdraw(token_id: string) {
        return JSON.stringify({
            "withdraw": {
                token_id,
            }
        });
    }

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
}


export class FirmaCosmWasmCwBridgeService {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService, private readonly cw721Service: FirmaCosmWasmCw721Service) { }

    public getCwBridgeMsgData () : typeof CwBridgeMsgData {
        return CwBridgeMsgData;
    }

    async changeOwner(wallet: FirmaWalletService, contractAddress: string, new_owner: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataChangeOwner(new_owner);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxChangeOwner(wallet: FirmaWalletService, contractAddress: string, new_owner: string) {
        const msgData = JSON.stringify({
            "change_owner": {
                new_owner,
            }
        });
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async addAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataAddAuthorizedUser(user);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxAddAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string) {
        const msgData = CwBridgeMsgData.getMsgDataAddAuthorizedUser(user);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async removeAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataRemoveAuthorizedUser(user);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxRemoveAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string) {
        const msgData = CwBridgeMsgData.getMsgDataRemoveAuthorizedUser(user);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async lock(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataLock();
		return await this.cw721Service.sendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData, txMisc);
    }

    async getUnsignedTxLock(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string) {
        const msgData = CwBridgeMsgData.getMsgDataLock();
        return await this.cw721Service.getUnsignedTxSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async deposit(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, toAddress: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataDeposit(toAddress);
        return await this.cw721Service.sendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData, txMisc);
    }

    async getUnsignedTxDeposit(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, toAddress: string) {
        const msgData = CwBridgeMsgData.getMsgDataDeposit(toAddress);
        return await this.cw721Service.getUnsignedTxSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async unlock(wallet: FirmaWalletService, contractAddress: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataUnlock(token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUnlock(wallet: FirmaWalletService, contractAddress: string, token_id: string) {
        const msgData = CwBridgeMsgData.getMsgDataUnlock(token_id);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async withdraw(wallet: FirmaWalletService, contractAddress: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwBridgeMsgData.getMsgDataWithdraw(token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxWithdraw(wallet: FirmaWalletService, contractAddress: string, token_id: string) {
        const msgData = CwBridgeMsgData.getMsgDataWithdraw(token_id);
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

    async getGasEstimationChangeOwner(wallet: FirmaWalletService, contractAddress: string, new_owner: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataChangeOwner(new_owner);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationAddAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataAddAuthorizedUser(user);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRemoveAuthorizedUser(wallet: FirmaWalletService, contractAddress: string, user: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataRemoveAuthorizedUser(user);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationLock(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataLock();
        return await this.cw721Service.getGasEstimationSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async getGasEstimationDeposit(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, toAddress: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataDeposit(toAddress);
        return await this.cw721Service.getGasEstimationSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async getGasEstimationUnlock(wallet: FirmaWalletService, contractAddress: string, token_id: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataUnlock(token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationWithdraw(wallet: FirmaWalletService, contractAddress: string, token_id: string): Promise<number> {
        const msgData = CwBridgeMsgData.getMsgDataWithdraw(token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    // query

    async getConfig(contractAddress: string) : Promise<BridgeConfig>{
        const query = `{"get_config": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getOwner(contractAddress: string) : Promise<string>{
        const query = `{"get_owner": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getAuthorizedUsers(contractAddress: string) : Promise<string[]>{
        const query = `{"get_authorized_users": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getNftInfo(contractAddress: string, tokenId: string) : Promise<NftInfo>{
        const query = `{"nft_info": { "token_id": "${tokenId}" }}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);

        return JSON.parse(result);
    }

    async getOwnerNfts(contractAddress: string, ownerAddress: string, limit: number = 10, start_after: string | null = null) : Promise<string[]>{
        const query = `{"owner_nfts": { "owner_addr": "${ownerAddress}", "limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null} }}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getOwnerNftsInfo(contractAddress: string, ownerAddress: string, limit: number = 10, start_after: string | null = null) : Promise<NftInfo[]>{
        const query = `{"owner_nfts_info": { "owner_addr": "${ownerAddress}", "limit": ${limit},"start_after": ${start_after !== null ? `"${start_after}"` : null} }}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getOwnerWithdrawableNfts(contractAddress: string, ownerAddress: string, limit: number = 10, start_after: string | null = null) : Promise<NftInfo[]>{
        const query = `{"owner_withdrawable_nfts": { "owner_addr": "${ownerAddress}", "limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getOwnerUnlockableNfts(contractAddress: string, ownerAddress: string, limit: number = 10, start_after: string | null = null) : Promise<NftInfo[]>{
        const query = `{"owner_unlockable_nfts": { "owner_addr": "${ownerAddress}", "limit": ${limit}, "start_after": "${start_after}" }}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getGlobalTxCounts(contractAddress: string) : Promise<BridgeGlobalTxCounts>{
        const query = `{"global_tx_counts": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }
}
