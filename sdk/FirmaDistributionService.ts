import {
    DistributionTxClient,
    DistributionQueryClient,
    TxMisc,
    DefaultTxMisc,
    getSignAndBroadcastOption,
    TotalRewardInfo
} from "./firmachain/distribution";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export class FirmaDistributionService {

    constructor(private readonly config: FirmaConfig) {}
    
    async getGasEstimationSetWithdrawAddress(wallet: FirmaWalletService,
            withdrawAddress: string,
            txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxSetWithdrawAddress(wallet, withdrawAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationFundCommunityPool(wallet: FirmaWalletService,
            amount: number,
            txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxFundCommunityPool(wallet, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationWithdrawValidatorCommission(wallet: FirmaWalletService,
            validatorAddress: string,
            txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxWithdrawValidatorCommission(wallet, validatorAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationWithdrawAllRewards(wallet: FirmaWalletService,
            validatorAddress: string,
            txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxWithdrawAllRewards(wallet, validatorAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxWithdrawAllRewards(wallet: FirmaWalletService,
        validatorAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const message =
                txClient.msgWithdrawDelegatorReward({ delegatorAddress: address, validatorAddress: validatorAddress });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSetWithdrawAddress(wallet: FirmaWalletService,
        withdrawAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const message =
                txClient.msgSetWithdrawAddress({ delegatorAddress: address, withdrawAddress: withdrawAddress });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxFundCommunityPool(wallet: FirmaWalletService,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const message = txClient.msgFundCommunityPool({ depositor: address, amount: [sendAmount] });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxWithdrawValidatorCommission(wallet: FirmaWalletService,
        validatorAddres: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = txClient.msgWithdrawValidatorCommission({ validatorAddress: validatorAddres });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async setWithdrawAddress(wallet: FirmaWalletService, withdrawAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxSetWithdrawAddress(wallet, withdrawAddress, txMisc);

            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async fundCommunityPool(wallet: FirmaWalletService, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxFundCommunityPool(wallet, amount, txMisc);

            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async withdrawValidatorCommission(wallet: FirmaWalletService,
        validatorAddres: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxWithdrawValidatorCommission(wallet, validatorAddres, txMisc);

            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async withdrawAllRewards(wallet: FirmaWalletService, validatorAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxWithdrawAllRewards(wallet, validatorAddress, txMisc);

            const txClient = new DistributionTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query
    // 

    async getRewardInfo(address: string, validatorAddress: string): Promise<string> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetRewardInfo(address, validatorAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getValidatorOutStandingReward(validatorAddress: string): Promise<Coin[]> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetValidatorOutStandingReward(validatorAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getValidatorCommission(validatorAddress: string): Promise<Coin[]> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetValidatorCommission(validatorAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalRewardInfo(address: string): Promise<TotalRewardInfo> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetTotalRewardInfo(address);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getCommunityPool(): Promise<string> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetCommunityPool();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getWithdrawAddress(address: string): Promise<string> {
        try {
            const queryClient = new DistributionQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetWithdrawAddress(address);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}