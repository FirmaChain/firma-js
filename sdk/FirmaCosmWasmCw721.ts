import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { Uint64 } from "@cosmjs/math";

export interface ExpireAll{
    never: string;
    at_height: Uint64;
    at_time: string;
}

export interface Cw721NftInfo{
    access: {
        owner: string;
        approvals: Cw721Approval[];
    }

    info: {
        token_uri: string;
        extension: Object;
    }
}

export interface Cw721ContractInfo{
    name: string;
    symbol: string;
}

export interface Cw721Approval {
    spender: string,
    expires: ExpireAll;
}

export class FirmaCosmWasmCw721Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }
    
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

    async getAllOperators(contractAddress: string, owner: string, isIncludeExpired: boolean = false) : Promise<Cw721Approval[]> {
        try {

            const query = `{"all_operators": { "owner": "${owner}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data.operators;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalNfts(contractAddress: string) : Promise<number> {
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

    async getContractInfo(contractAddress: string) : Promise<Cw721ContractInfo> {
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

    async getNftTokenUri(contractAddress: string, tokenId: string) : Promise<string> {
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

    async getNftData(contractAddress: string, tokenId: string) : Promise<Cw721NftInfo> {
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

    async getNFTIdListOfOwner(contractAddress: string, owner: string) : Promise<string[]> {
        try {

            const query = `{"tokens": { "owner": "${owner}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // TODO: for many items, limit, start_after can be added later
    async getAllNftIdList(contractAddress: string) : Promise<string[]> {
        try {

            
            const query = `{"all_tokens": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);
		    
            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMinter(contractAddress: string) : Promise<string>  {
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

    // NOTICE: need to check how to use extension
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
}