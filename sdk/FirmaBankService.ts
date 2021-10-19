import { BankTxClient, BankQueryClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption } from "./firmachain/bank";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export class FirmaBankService {

    constructor(private readonly config: FirmaConfig) {}

    async getGasEstimationSend(wallet: FirmaWalletService,
        targetAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSend(wallet, targetAddress, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async send(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxSend(wallet, targetAddress, amount, txMisc);

            const bankTxClient = new BankTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            const bankQueryClient = new BankQueryClient(this.config.restApiAddress);
            const result = await bankQueryClient.queryBalance(address, this.config.denom);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    private async getSignedTxSend(wallet: FirmaWalletService,
        targetAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const bankTxClient = new BankTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };
            const message = bankTxClient.msgSend({ fromAddress: address, toAddress: targetAddress, amount: [sendAmount] });

            return await bankTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


}