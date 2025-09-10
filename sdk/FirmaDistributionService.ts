import {
    DistributionTxClient,
    DistributionQueryClient,
    TxMisc,
    TotalRewardInfo,
    MsgWithdrawDelegatorRewardEncodeObject
} from "./firmachain/distribution";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { DelegationInfo } from "./firmachain/staking";
import { DeliverTxResponse } from "@cosmjs/stargate";

export class FirmaDistributionService {

    constructor(private readonly config: FirmaConfig) { }

    public getTxClient(wallet: FirmaWalletService) : DistributionTxClient {
        return new DistributionTxClient(wallet, this.config.rpcAddress);
    }

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

    async getGasEstimationWithdrawAllRewardsFromAllValidator(wallet: FirmaWalletService, delegationList: DelegationInfo[], txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxwithdrawAllRewardsFromAllValidator(wallet, delegationList, txMisc);
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
            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);

            const address = await wallet.getAddress();
            const message = DistributionTxClient.msgWithdrawDelegatorReward({ delegatorAddress: address, validatorAddress: validatorAddress });

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
            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);

            const address = await wallet.getAddress();
            const message = DistributionTxClient.msgSetWithdrawAddress({ delegatorAddress: address, withdrawAddress: withdrawAddress });

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
            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const message = DistributionTxClient.msgFundCommunityPool({ depositor: address, amount: [sendAmount] });

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
            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);

            const message = DistributionTxClient.msgWithdrawValidatorCommission({ validatorAddress: validatorAddres });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async setWithdrawAddress(wallet: FirmaWalletService, withdrawAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxSetWithdrawAddress(wallet, withdrawAddress, txMisc);

            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async fundCommunityPool(wallet: FirmaWalletService, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxFundCommunityPool(wallet, amount, txMisc);

            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }



    async withdrawValidatorCommission(wallet: FirmaWalletService,
        validatorAddres: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxWithdrawValidatorCommission(wallet, validatorAddres, txMisc);

            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxwithdrawAllRewardsFromAllValidator(wallet: FirmaWalletService,
        delegationList: DelegationInfo[],
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();
            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);

            let messageList: MsgWithdrawDelegatorRewardEncodeObject[] = [];

            const totalRewardInfo = await this.getTotalRewardInfo(address);

            // Filter delegation list to include only validators that have rewards in totalRewardInfo
            // If rewards are empty, filter delegations
            const filteredDelegationList = delegationList.filter(delegation => {
                const hasReward = totalRewardInfo.rewards.some(reward => reward.validator_address === delegation.delegation.validator_address);
                
                if (!hasReward) {
                    FirmaUtil.printLog(`Validator filtered. Will not request to withdraw reward from zero reward validator: ${delegation.delegation.validator_address}, delegation amount=${delegation.balance.amount}`);
                }
                
                return hasReward;
            });

            for (let i = 0; i < filteredDelegationList.length; i++) {
                const validatorAddress = filteredDelegationList[i].delegation.validator_address;
                const message = DistributionTxClient.msgWithdrawDelegatorReward({ delegatorAddress: address, validatorAddress: validatorAddress });

                messageList.push(message);
            }

            return await txClient.sign(messageList, getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async withdrawAllRewardsFromAllValidator(wallet: FirmaWalletService, delegationList: DelegationInfo[], txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {

            const txRaw = await this.getSignedTxwithdrawAllRewardsFromAllValidator(wallet, delegationList, txMisc);

            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async withdrawAllRewards(wallet: FirmaWalletService, validatorAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxWithdrawAllRewards(wallet, validatorAddress, txMisc);

            const txClient = new DistributionTxClient(wallet, this.config.rpcAddress);
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