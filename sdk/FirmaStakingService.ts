import {
    StakingTxClient,
    StakingQueryClient,
    TxMisc,
    DefaultTxMisc,
    getSignAndBroadcastOption,
    ValidatorDataType,
    PoolDataType,
    ParamsDataType,
    DelegationInfo,
    RedelegationInfo,
    UndelegationInfo
} from "./firmachain/staking";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { Description } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { MsgCreateValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";

export class FirmaStakingService {

    constructor(private readonly config: FirmaConfig) {}

    async getGasEstimationDelegate(wallet: FirmaWalletService,
        validatorAddres: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxDelegate(wallet, validatorAddres, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationUndelegate(wallet: FirmaWalletService,
        validatorAddres: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxUndelegate(wallet, validatorAddres, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationRedelegate(wallet: FirmaWalletService,
        validatorSrcAddress: string,
        validatorDstAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxRedelegate(wallet, validatorSrcAddress, validatorDstAddress, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxDelegate(wallet: FirmaWalletService,
        validatorAddres: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const message = txClient.msgDelegate({
                delegatorAddress: address,
                validatorAddress: validatorAddres,
                amount: sendAmount
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxUndelegate(wallet: FirmaWalletService,
        validatorAddres: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const message = txClient.msgUndelegate({
                delegatorAddress: address,
                validatorAddress: validatorAddres,
                amount: sendAmount
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxRedelegate(wallet: FirmaWalletService,
        validatorSrcAddress: string,
        validatorDstAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const message = txClient.msgRedelegate({
                delegatorAddress: address,
                validatorSrcAddress: validatorSrcAddress,
                validatorDstAddress: validatorDstAddress,
                amount: sendAmount
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxCreateValidator(wallet: FirmaWalletService,
        validatorInfo: MsgCreateValidator,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = txClient.msgCreateValidator({
                description: validatorInfo.description,
                commission: validatorInfo.commission,
                minSelfDelegation: validatorInfo.minSelfDelegation,
                delegatorAddress: validatorInfo.delegatorAddress,
                validatorAddress: validatorInfo.validatorAddress,
                pubkey: validatorInfo.pubkey,
                value: validatorInfo.value
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxEditValidator(wallet: FirmaWalletService,
        validatorAddress: string,
        description: Description,
        commissionRate: string,
        minSelfDelegation: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = txClient.msgEditValidator({
                validatorAddress: validatorAddress,
                description: description,
                commissionRate: commissionRate,
                minSelfDelegation: minSelfDelegation
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async createValidator(wallet: FirmaWalletService,
        validatorInfo: MsgCreateValidator,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxCreateValidator(wallet, validatorInfo, txMisc);

            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async editValidator(wallet: FirmaWalletService,
        validatorAddress: string,
        description: Description,
        commissionRate: string,
        minSelfDelegation: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxEditValidator(wallet,
                validatorAddress,
                description,
                commissionRate,
                minSelfDelegation,
                txMisc);

            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async redelegate(wallet: FirmaWalletService,
        validatorSrcAddress: string,
        validatorDstAddress: string,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

        try {
            const txRaw =
                await this.getSignedTxRedelegate(wallet, validatorSrcAddress, validatorDstAddress, amount, txMisc);

            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async undelegate(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxUndelegate(wallet, targetAddress, amount, txMisc);

            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async delegate(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxDelegate(wallet, targetAddress, amount, txMisc);

            const txClient = new StakingTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query

    async getUndelegationInfoFromValidator(address: string, validatorAddress: string): Promise<UndelegationInfo> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetUndelegationInfoFromValidator(address, validatorAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getDelegationInfoFromValidator(address: string, validatorAddress: string): Promise<DelegationInfo> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetDelegationInfoFromValidator(address, validatorAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalUndelegateInfo(address: string): Promise<UndelegationInfo[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetTotalUndelegateInfo(address);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalRedelegationInfo(address: string): Promise<RedelegationInfo[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.querygetTotalRedelegationInfo(address);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getUndelegationListFromValidator(valoperAddress: string): Promise<UndelegationInfo[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetUndelegationListFromValidator(valoperAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getDelegationListFromValidator(valoperAddress: string): Promise<DelegationInfo[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetDelegateListFromValidator(valoperAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalDelegationInfo(address: string): Promise<DelegationInfo[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetTotalDelegationInfo(address);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getParams(): Promise<ParamsDataType> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetParams();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getPool(): Promise<PoolDataType> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetPool();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getValidator(valoperAddress: string): Promise<ValidatorDataType> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryValidator(valoperAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getValidatorList(): Promise<ValidatorDataType[]> {
        try {
            const queryClient = new StakingQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryValidators();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

}