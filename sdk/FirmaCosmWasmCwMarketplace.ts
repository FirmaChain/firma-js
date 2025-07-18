import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";
import { CosmWasmTxClient } from "./firmachain/cosmwasm/CosmWasmTxClient";
import { EncodeObject } from "@cosmjs/proto-signing";
import { FirmaCosmWasmCw721Service } from "./FirmaCosmWasmCw721";
import { FirmaCosmWasmCw20Service } from "./FirmaCosmWasmCw20";
import { DeliverTxResponse } from "@cosmjs/stargate";

export interface MarketplaceConfig {
    owner: string;
    cw721_address: string;
    cw20_addresses: string[];
    fee_address: string;
    fee_rate: number;
    firma_fee_address: string;
    firma_fee_rate: number;
}

export interface MarketplaceRegisterData {
    seller: string;
    token_id: string;
    sale_type: string; // FCT, CW20
    amount: string;
    cw20_address: string;
}

// staic util
const noFunds: any = [];

export class CwMarketplaceMsgData {

    static getMsgDataChangeOwner(new_owner: string) {
        return JSON.stringify({
            "change_owner": {
                new_owner,
            }
        });
    }

    static getMsgDataRegisterSaleFCT(amount: string) {
        return {
			action: "registerSaleFct",
            cw20_address: "",
            amount
		}
    }

    static getMsgDataRegisterSaleCw20(cw20_address: string, amount: string) {
        return {
			action: "registerSaleCw20",
            cw20_address,
            amount
		}
    }

    static getMsgDataPurchaseSaleFCT(token_id: string) {
        return JSON.stringify({
            "purchase_sale_fct": {
                token_id,
            }
        });
    }

    static getMsgDataPurchaseSaleCw20(token_id: string) {
        return {
			action: "purchaseSaleCW20",
            token_id,
		}
    }

    static getMsgDataCancelSale(token_id: string) {
        return JSON.stringify({
            "cancel_sale": {
                token_id,
            }
        });
    }
}

export class FirmaCosmWasmCwMarketplaceService {

    constructor(private readonly config: FirmaConfig, 
        private readonly cosmwasmService: FirmaCosmWasmService, 
        private readonly cw721Service: FirmaCosmWasmCw721Service,
        private readonly cw20Service: FirmaCosmWasmCw20Service
        ) { }

    public getCwMarketplaceMsgData () : typeof CwMarketplaceMsgData {
        return CwMarketplaceMsgData;
    }

    async changeOwner(wallet: FirmaWalletService, contractAddress: string, new_owner: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwMarketplaceMsgData.getMsgDataChangeOwner(new_owner);
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

    async registerSaleFCT(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, fctAmount: number, txMisc: TxMisc = DefaultTxMisc) {
        const amount = FirmaUtil.getUFCTStringFromFCT(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataRegisterSaleFCT(amount);

		return await this.cw721Service.sendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData,  txMisc);
    }

    async getUnsignedTxRegisterSaleFCT(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, fctAmount: number) {
        const amount = FirmaUtil.getUFCTStringFromFCT(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataRegisterSaleFCT(amount);

        return await this.cw721Service.getUnsignedTxSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async registerSaleCw20(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, cw20Address: string, cw20Amount: number, cw20Decimal: number, txMisc: TxMisc = DefaultTxMisc) {
        const amount = FirmaUtil.getUTokenStringFromToken(cw20Amount, cw20Decimal);
        const msgData = CwMarketplaceMsgData.getMsgDataRegisterSaleCw20(cw20Address, amount);

		return await this.cw721Service.sendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData, txMisc);
    }

    async purchaseSaleFCT(wallet: FirmaWalletService, contractAddress: string, tokenId: string, fctAmount: number, txMisc: TxMisc = DefaultTxMisc) {
        const amount = FirmaUtil.getUFCTStringFromFCT(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleFCT(tokenId);

        const funds = [{ denom: this.config.denom, amount }];

        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, funds, txMisc);
    }

    async getUnsignedTxPurchaseSaleFCT(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, fctAmount: string) {
        const amount = FirmaUtil.getUFCTStringFromFCTStr(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleFCT(amount);

        const funds = [{ denom: this.config.denom, amount }];

        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, funds);
    }

    async purchaseSaleCw20(wallet: FirmaWalletService, contractAddress: string, tokenId: string, cw20Address: string, cw20Amount: number, cw20Decimal: number, txMisc: TxMisc = DefaultTxMisc) {
        const amount = FirmaUtil.getUTokenStringFromToken(cw20Amount, cw20Decimal);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleCw20(tokenId);

        return await this.cw20Service.send(wallet, cw20Address, contractAddress, amount, msgData, txMisc);
    }

    async getUnsignedTxPurchaseSaleCw20(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, cw20Address: string, cw20Amount: number, cw20Decimal: number) {
        const amount = FirmaUtil.getUTokenStringFromToken(cw20Amount, cw20Decimal);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleCw20(amount);

        return await this.cw20Service.getUnsignedTxSend(wallet, cw20Address, contractAddress, amount, msgData);
    }

    async cancelSale(wallet: FirmaWalletService, contractAddress: string, tokenId: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = CwMarketplaceMsgData.getMsgDataCancelSale(tokenId);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxCancelSale(wallet: FirmaWalletService, contractAddress: string, tokenId: string) {
        const msgData = CwMarketplaceMsgData.getMsgDataCancelSale(tokenId);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async signAndBroadcast(wallet: FirmaWalletService, msgList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
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
        const msgData = CwMarketplaceMsgData.getMsgDataChangeOwner(new_owner);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRegisterSaleFCT(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, fctAmount: number): Promise<number> {
        const amount = FirmaUtil.getUFCTStringFromFCT(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataRegisterSaleFCT(amount);
        
        return await this.cw721Service.getGasEstimationSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async getGasEstimationRegisterSaleCw20(wallet: FirmaWalletService, contractAddress: string, cw721ContractAddress: string, tokenId: string, cw20Address: string, cw20Amount: number, cw20Decimal: number): Promise<number> {
        const amount = FirmaUtil.getUTokenStringFromToken(cw20Amount, cw20Decimal);
        const msgData = CwMarketplaceMsgData.getMsgDataRegisterSaleCw20(cw20Address, amount);

        return await this.cw721Service.getGasEstimationSendNft(wallet, cw721ContractAddress, contractAddress, tokenId, msgData);
    }

    async getGasEstimationPurchaseSaleFCT(wallet: FirmaWalletService, contractAddress: string, tokenId: string, fctAmount: number): Promise<number> {
        const amount = FirmaUtil.getUFCTStringFromFCT(fctAmount);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleFCT(tokenId);

        const funds = [{ denom: this.config.denom, amount }];
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, funds);
    }

    async getGasEstimationPurchaseSaleCw20(wallet: FirmaWalletService, contractAddress: string, tokenId: string, cw20Address: string, cw20Amount: number, cw20Decimal: number): Promise<number> {
        const amount = FirmaUtil.getUTokenStringFromToken(cw20Amount, cw20Decimal);
        const msgData = CwMarketplaceMsgData.getMsgDataPurchaseSaleCw20(tokenId);

        return await this.cw20Service.getGasEstimationSend(wallet, cw20Address, contractAddress, amount, msgData);
    }

    async getGasEstimationCancelSale(wallet: FirmaWalletService, contractAddress: string, tokenId: string): Promise<number> {
        const msgData = CwMarketplaceMsgData.getMsgDataCancelSale(tokenId);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }
    
    // query

    async getConfig(contractAddress: string) : Promise<MarketplaceConfig>{
        const query = `{"get_config": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getOwner(contractAddress: string) : Promise<string>{
        const query = `{"get_owner": {}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getRegisterList(contractAddress: string, limit: number = 10, start_after: string | null = null) : Promise<MarketplaceRegisterData[]>{
        const query = `{"get_register_list": { "limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }

    async getRegisterListByAddress(contractAddress: string, address: string, limit: number = 10, start_after: string | null = null) : Promise<MarketplaceRegisterData[]>{
        const query = `{"get_register_list_by_address": { "address": "${address}", "limit": ${limit},"start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
        const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
        return JSON.parse(result);
    }
}
