import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";
import { EncodeObject } from "@cosmjs/proto-signing";
import { CosmWasmTxClient } from "./firmachain/cosmwasm";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export interface Cw20Minter {
    minter: string;
    cap: string;
}

export interface Cw20MarketingInfo {
    project: string;
    description: string;
    logo: {
        url: string;
    };
    marketing: string;
}

export interface Cw20TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
}

export interface ExpiresAtHeight {
    at_height: number;
}

export interface ExpiresAtTime {
    at_time: string; // Unix timestamp nano seconds
}

export interface ExpiresNever {
    never: {};
}

export type Expires = ExpiresAtHeight | ExpiresAtTime | ExpiresNever;

export interface Cw20Allowance {
    allowance: string;
    expires: Expires;
}

export interface Cw20SpenderAllowance {
    allowance: string;
    expires: Expires;
    spender: string;
}


// staic util
const noFunds: any = [];

export class Cw20MsgData {

    static getMsgDataTransfer(recipient: string, amount: string) {
        return JSON.stringify({
            "transfer": {
                recipient,
                amount: amount
            }
        });
    }
    
    static getMsgDataTransferFrom(owner: string, recipient: string, amount: string) {
        return JSON.stringify({
            "transfer_from": {
                owner,
                recipient,
                amount: amount
            }
        });
    }
    
    static getMsgDataMint(recipient: string, amount: string) {
        return JSON.stringify({
            "mint": {
                recipient,
                amount
            }
        });
    }
    
    static getMsgDataBurn(amount: string) {
        return JSON.stringify({
            "burn": {
                amount: amount
            }
        });
    }
    
    static getMsgDataBurnFrom(owner: string, amount: string) {
        return JSON.stringify({
            "burn_from": {
                owner,
                amount: amount
            }
        });
    }
    
    static getMsgDataIncreaseAllowance(spender: string, amount: string, expires: Expires) {
        return JSON.stringify({
            "increase_allowance": {
                spender,
                amount,
                expires
            }
        });
    }
    
    static getMsgDataDecreaseAllowance(spender: string, amount: string, expires: Expires) {
        return JSON.stringify({
            "decrease_allowance": {
                spender,
                amount,
                expires
            }
        });
    }
    
    static getMsgDataUpdateMinter(new_minter: string) {
        return JSON.stringify({
            "update_minter": {
                new_minter,
            }
        });
    }
    
    static getMsgDataUpdateMarketing(description: string, marketing: string, project: string) {
        return JSON.stringify({
            "update_marketing": {
                description,
                marketing,
                project
            }
        });
    }
    
    static getMsgDataUploadLogo(url: string) {
        return JSON.stringify({
            "upload_logo": {
                url
            }
        });
    }
    
    static getMsgDataSend(contract: string, amount: string, msg: any) {
        return JSON.stringify({
            "send": {
                contract,
                amount,
                msg: btoa(JSON.stringify(msg))
            }
        });
    }
    
    static getMsgDataSendFrom(contract: string, owner: string, amount: string, msg: any) {
        return JSON.stringify({
            "send_from": {
                contract,
                owner,
                amount,
                msg: btoa(JSON.stringify(msg))
            }
        });
    }

}

// class
export class FirmaCosmWasmCw20Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }
    
    // tx
    async transfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataTransfer(recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string) {
        const msgData = Cw20MsgData.getMsgDataTransfer(recipient, amount);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async transferFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataTransferFrom(owner, recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxTransferFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, recipient: string, amount: string) {
        const msgData = Cw20MsgData.getMsgDataTransferFrom(owner, recipient, amount);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async mint(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataMint(recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxMint(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string) {
        const msgData = Cw20MsgData.getMsgDataMint(recipient, amount);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async burn(wallet: FirmaWalletService, contractAddress: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataBurn(amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxBurn(wallet: FirmaWalletService, contractAddress: string, amount: string) {
        const msgData = Cw20MsgData.getMsgDataBurn(amount);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async burnFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataBurnFrom(owner, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxBurnFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, amount: string) {
        const msgData = Cw20MsgData.getMsgDataBurnFrom(owner, amount);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async increaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataIncreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxIncreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires) {
        const msgData = Cw20MsgData.getMsgDataIncreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async decreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataDecreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxDecreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires) {
        const msgData = Cw20MsgData.getMsgDataDecreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async updateMinter(wallet: FirmaWalletService, contractAddress: string, new_minter: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataUpdateMinter(new_minter);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUpdateMinter(wallet: FirmaWalletService, contractAddress: string, new_minter: string) {
        const msgData = Cw20MsgData.getMsgDataUpdateMinter(new_minter);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async updateMarketing(wallet: FirmaWalletService, contractAddress: string, description: string, marketing: string, project: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataUpdateMarketing(description, marketing, project);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUpdateMarketing(wallet: FirmaWalletService, contractAddress: string, description: string, marketing: string, project: string) {
        const msgData = Cw20MsgData.getMsgDataUpdateMarketing(description, marketing, project);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async uploadLogo(wallet: FirmaWalletService, contractAddress: string, url: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataUploadLogo(url);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxUploadLogo(wallet: FirmaWalletService, contractAddress: string, url: string) {
        const msgData = Cw20MsgData.getMsgDataUploadLogo(url);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async send(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, amount: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataSend(targetContractAddress, amount, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxSend(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, amount: string, msg: any) {
        const msgData = Cw20MsgData.getMsgDataSend(targetContractAddress, amount, msg);
        return await this.cosmwasmService.getUnsignedTxExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async sendFrom(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, owner: string, amount: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = Cw20MsgData.getMsgDataSendFrom(targetContractAddress, owner, amount, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async getUnsignedTxSendFrom(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, owner: string, amount: string, msg: any) {
        const msgData = Cw20MsgData.getMsgDataSendFrom(targetContractAddress, owner, amount, msg);
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
    async getGasEstimationTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataTransfer(recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationTransferFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, recipient: string, amount: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataTransferFrom(owner, recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationMint(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataMint(recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, contractAddress: string, amount: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataBurn(amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurnFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, amount: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataBurnFrom(owner, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationIncreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataIncreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationDecreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataDecreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateMinter(wallet: FirmaWalletService, contractAddress: string, new_minter: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataUpdateMinter(new_minter);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateMarketing(wallet: FirmaWalletService, contractAddress: string, description: string, marketing: string, project: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataUpdateMarketing(description, marketing, project);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUploadLogo(wallet: FirmaWalletService, contractAddress: string, logo: string): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataUploadLogo(logo);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSend(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, amount: string, msg: any): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataSend(targetContractAddress, amount, msg);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSendFrom(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, owner: string, amount: string, msg: any): Promise<number> {
        const msgData = Cw20MsgData.getMsgDataSendFrom(targetContractAddress, owner, amount, msg);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

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

    async getTokenInfo(contractAddress: string): Promise<Cw20TokenInfo> {
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

    async getMinter(contractAddress: string): Promise<Cw20Minter> {
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



    async getAllowance(contractAddress: string, owner: string, spender: string): Promise<Cw20Allowance> {
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

    async getAllAllowances(contractAddress: string, owner: string, limit: number = 10, start_after: string | null = null): Promise<Cw20SpenderAllowance[]> {
        try {

            const query = `{"all_allowances": {"owner": "${owner}", "limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.allowances;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllSpenderAllowances(contractAddress: string, spender: string, limit: number = 10, start_after: string | null = null): Promise<Cw20SpenderAllowance[]> {
        try {

            const query = `{"all_spender_allowances": {"spender": "${spender}", "limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.allowances;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllAccounts(contractAddress: string, limit: number = 10, start_after: string | null = null): Promise<string[]> {
        try {

            const query = `{"all_accounts": {"limit": ${limit}, "start_after": ${start_after !== null ? `"${start_after}"` : null}}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.accounts;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMarketingInfo(contractAddress: string): Promise<Cw20MarketingInfo> {
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