import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { ClientState, IbcQueryClient, IbcTxClient, TxMisc } from "./firmachain/ibc";
import { Height } from "cosmjs-types/ibc/core/client/v1/client";
import { DeliverTxResponse } from "@cosmjs/stargate";

export class FirmaIbcService {

    constructor(private readonly config: FirmaConfig) { }

    public getTxClient(wallet: FirmaWalletService) : IbcTxClient {
        return new IbcTxClient(wallet, this.config.rpcAddress);
    }

    async getGasEstimationTransfer(wallet: FirmaWalletService,
        sourcePort: string,
        sourceChannel: string,
        denom: string,
        amount: string,
        receiver: string,
        timeoutHeight: Height,
        timeoutTimestamp: bigint,
        memo: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<number>  {
        try {
            const txRaw = await this.getSignedTxTransfer(wallet, sourcePort, sourceChannel, denom, amount, receiver, timeoutHeight, timeoutTimestamp, memo, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async transfer(wallet: FirmaWalletService,
        sourcePort: string,
        sourceChannel: string,
        denom: string,
        amount: string,
        receiver: string,
        timeoutHeight: Height,
        timeoutTimestamp: bigint,
        memo: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxTransfer(wallet, sourcePort, sourceChannel, denom, amount, receiver, timeoutHeight, timeoutTimestamp, memo, txMisc);

            const txClient = new IbcTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxTransfer(wallet: FirmaWalletService,
        sourcePort: string,
        sourceChannel: string,
        denom: string,
        amount: string,
        receiver: string,
        timeoutHeight: Height,
        timeoutTimestamp: bigint,
        memo: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();

            const message = IbcTxClient.msgTransfer({
                sourcePort: sourcePort, sourceChannel: sourceChannel, sender: address, receiver: receiver,
                token: { denom: denom, amount: amount },
                timeoutHeight: timeoutHeight, timeoutTimestamp: timeoutTimestamp,
                memo: memo
            });

            const ibcTxClient = new IbcTxClient(wallet, this.config.rpcAddress);
            return await ibcTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query

    async getClientState(sourceChannel: string, sourcePort: string) : Promise<ClientState>{

        try {
            const queryClient = new IbcQueryClient(this.config.restApiAddress);
            const result = await queryClient.getClientState(sourceChannel, sourcePort);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }

    }
}