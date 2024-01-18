import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";

export interface Cw20Minter {
    minter: string;
    cap: string;
}

export interface Cw20MarketingInfo {
    project: string;
    description: string;
    logo: string;
    marketing: string;
}

export interface ExpiresAtHeight {
    at_height: number;
}

export interface ExpiresAtTime {
    at_time: number; // Unix 타임스탬프 형태
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

function getMsgDataTransfer(recipient: string, amount: string) {
    return JSON.stringify({
        "transfer": {
            recipient,
            amount: amount
        }
    });
}

function getMsgDataTransferFrom(owner: string, recipient: string, amount: string) {
    return JSON.stringify({
        "transfer_from": {
            owner,
            recipient,
            amount: amount
        }
    });
}

function getMsgDataMint(recipient: string, amount: string) {
    return JSON.stringify({
        "mint": {
            recipient,
            amount
        }
    });
}

function getMsgDataBurn(amount: string) {
    return JSON.stringify({
        "burn": {
            amount: amount
        }
    });
}

function getMsgDataBurnFrom(owner: string, amount: string) {
    return JSON.stringify({
        "burn_from": {
            owner,
            amount: amount
        }
    });
}

function getMsgDataIncreaseAllowance(spender: string, amount: string, expires: Expires) {
    return JSON.stringify({
        "increase_allowance": {
            spender,
            amount,
            expires
        }
    });
}

function getMsgDataDecreaseAllowance(spender: string, amount: string, expires: Expires) {
    return JSON.stringify({
        "decrease_allowance": {
            spender,
            amount,
            expires
        }
    });
}

function getMsgDataUpdateMinter(new_minter: string) {
    return JSON.stringify({
        "update_minter": {
            new_minter,
        }
    });
}

function getMsgDataUpdateMarketing(description: string, marketing: string, project: string) {
    return JSON.stringify({
        "update_marketing": {
            description,
            marketing,
            project
        }
    });
}

function getMsgDataUploadLogo(url: string) {
    return JSON.stringify({
        "upload_logo": {
            url
        }
    });
}

function getMsgDataSend(contract: string, amount: string, msg: any) {
    return JSON.stringify({
        "send": {
            contract,
            amount,
            msg: btoa(JSON.stringify(msg))
        }
    });
}

function getMsgDataSendFrom(contract: string, owner: string, amount: string, msg: any) {
    return JSON.stringify({
        "send_from": {
            contract,
            owner,
            amount,
            msg: btoa(JSON.stringify(msg))
        }
    });
}

// class
export class FirmaCosmWasmCw20Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }

    // tx
    async transfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataTransfer(recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async transferFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataTransferFrom(owner, recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async mint(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataMint(recipient, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async burn(wallet: FirmaWalletService, contractAddress: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataBurn(amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async burnFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, amount: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataBurnFrom(owner, amount);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async increaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataIncreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async decreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataDecreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async updateMinter(wallet: FirmaWalletService, contractAddress: string, new_minter: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataUpdateMinter(new_minter);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async updateMarketing(wallet: FirmaWalletService, contractAddress: string, description: string, marketing: string, project: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataUpdateMarketing(description, marketing, project);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async uploadLogo(wallet: FirmaWalletService, contractAddress: string, url: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataUploadLogo(url);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async send(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, amount: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataSend(targetContractAddress, amount, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async sendFrom(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, owner: string, amount: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataSendFrom(targetContractAddress, owner, amount, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    // gas
    async getGasEstimationTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string): Promise<number> {
        const msgData = getMsgDataTransfer(recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationTransferFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, recipient: string, amount: string): Promise<number> {
        const msgData = getMsgDataTransferFrom(owner, recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationMint(wallet: FirmaWalletService, contractAddress: string, recipient: string, amount: string): Promise<number> {
        const msgData = getMsgDataMint(recipient, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, contractAddress: string, amount: string): Promise<number> {
        const msgData = getMsgDataBurn(amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurnFrom(wallet: FirmaWalletService, contractAddress: string, owner: string, amount: string): Promise<number> {
        const msgData = getMsgDataBurnFrom(owner, amount);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationIncreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires): Promise<number> {
        const msgData = getMsgDataIncreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationDecreaseAllowance(wallet: FirmaWalletService, contractAddress: string, spender: string, amount: string, expires: Expires): Promise<number> {
        const msgData = getMsgDataDecreaseAllowance(spender, amount, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateMinter(wallet: FirmaWalletService, contractAddress: string, new_minter: string): Promise<number> {
        const msgData = getMsgDataUpdateMinter(new_minter);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateMarketing(wallet: FirmaWalletService, contractAddress: string, description: string, marketing: string, project: string): Promise<number> {
        const msgData = getMsgDataUpdateMarketing(description, marketing, project);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUploadLogo(wallet: FirmaWalletService, contractAddress: string, logo: string): Promise<number> {
        const msgData = getMsgDataUploadLogo(logo);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSend(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, amount: string, msg: any): Promise<number> {
        const msgData = getMsgDataSend(targetContractAddress, amount, msg);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSendFrom(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, owner: string, amount: string, msg: any): Promise<number> {
        const msgData = getMsgDataSendFrom(targetContractAddress, owner, amount, msg);
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

    async getAllAllowances(contractAddress: string, owner: string): Promise<Cw20SpenderAllowance[]> {
        try {

            const query = `{"all_allowances": {"owner": "${owner}"}}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.allowances;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllSpenderAllowances(contractAddress: string, spender: string): Promise<Cw20SpenderAllowance> {
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