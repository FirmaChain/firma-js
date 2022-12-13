import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";

export class FirmaCosmWasmCw20Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }
    
    // query
    async getBalance(contractAddress: string, address: string): Promise<string> {
        try {

            const query = `{"balance": { "address": "${address}" }}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data.balance;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalSupply(contractAddress: string): Promise<string> {
        try {

            const query = `{"token_info": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data.total_supply;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTokenInfo(contractAddress: string): Promise<string> {
        try {

            const query = `{"token_info": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMinter(contractAddress: string): Promise<string> {
        try {

            const query = `{"minter": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllowance(contractAddress: string, owner: string, spender: string): Promise<string> {
        try {

            const query = `{"allowance": {"owner": "${owner}", "spender":"${spender}"}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllAllowances(contractAddress: string, owner: string): Promise<string> {
        try {

            const query = `{"all_allowances": {"owner": "${owner}"}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllSpenderAllowances(contractAddress: string, spender: string): Promise<string> {
        try {

            const query = `{"all_spender_allowances": {"spender": "${spender}"}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllAccounts(contractAddress: string): Promise<string> {
        try {

            const query = `{"all_accounts": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMarketingInfo(contractAddress: string): Promise<string> {
        try {

            const query = `{"marketing_info": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getDownloadLogo(contractAddress: string): Promise<string> {
        try {

            const query = `{"download_logo": {}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}