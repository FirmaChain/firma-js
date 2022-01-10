import { BankTxClient, BankQueryClient, TxMisc, Token } from "./firmachain/bank";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export class FirmaBankService {

    constructor(private readonly config: FirmaConfig) { }

    async getGasEstimationSend(wallet: FirmaWalletService,
        targetAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSend(wallet, targetAddress, this.config.denom, FirmaUtil.getUFCTStringFromFCT(amount), txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async sendToken(wallet: FirmaWalletService, targetAddress: string, tokenID: string, amount: number, decimal: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {

            const txRaw = await this.getSignedTxSend(wallet, targetAddress, tokenID, FirmaUtil.getUTokenStringFromToken(amount, decimal), txMisc);

            const bankTxClient = new BankTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async send(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxSend(wallet, targetAddress, this.config.denom, FirmaUtil.getUFCTStringFromFCT(amount), txMisc);

            const bankTxClient = new BankTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTokenBalanceList(address: string): Promise<Token[]> {
        try {
            const bankQueryClient = new BankQueryClient(this.config.restApiAddress);
            const result = await bankQueryClient.queryBalanceList(address);

            let tokenList: Token[] = [];

            for (let i = 0; i < result.length; i++) {

                // ignore config.denom
                if (result[i].denom === this.config.denom)
                    continue;

                tokenList.push(result[i]);
            }

            return tokenList;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTokenBalance(address: string, tokenID: string): Promise<string> {
        try {
            const bankQueryClient = new BankQueryClient(this.config.restApiAddress);
            const result = await bankQueryClient.queryTokenBalance(address, tokenID);

            return result.amount;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            const bankQueryClient = new BankQueryClient(this.config.restApiAddress);
            const result = await bankQueryClient.queryBalance(address, this.config.denom);

            return result.amount;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSend(wallet: FirmaWalletService,
        targetAddress: string,
        denom: string,
        amount: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const bankTxClient = new BankTxClient(wallet, this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: denom, amount: amount };

            const message = bankTxClient.msgSend({ fromAddress: address, toAddress: targetAddress, amount: [sendAmount] });

            return await bankTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}