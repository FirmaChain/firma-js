import {
    FeeGrantTxClient,
    TxMisc,
    DefaultTxMisc,
    getSignAndBroadcastOption,
    DefaultBasicFeeGrantOption,
    BasicFeeGrantOption,
    PeriodicFeeGrantOption
} from "./firmachain/feegrant";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { BasicAllowance, PeriodicAllowance } from "./firmachain/feegrant/FeeGrantTxTypes";
import { FeeAllowanceType, FeeAllowanceType1, FeeGrantQueryClient } from "./firmachain/feegrant/FeeGrantQueryClient";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { Any } from "./firmachain/google/protobuf/any";

export class FirmaFeeGrantService {

    constructor(private readonly config: FirmaConfig) {}

    async getGasEstimationRevokeAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxRevokeAllowance(wallet,
                granteeAddress,
                txMisc);

            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxRevokeAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            const message = feeGrantTxClient.msgRevokeAllowance({ granter: address, grantee: granteeAddress });

            return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async revokeAllowance(wallet: FirmaWalletService, granteeAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxRevokeAllowance(wallet, granteeAddress, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await feeGrantTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private getCoinType(amount?: number): Coin[] {

        if (amount == undefined)
            return [];

        return [{ denom: this.config.denom, amount: amount!.toString() }];
    }

    async getGasEstimationGrantPeriodicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: PeriodicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxGrantPeriodicAllowance(wallet,
                granteeAddress,
                feegrantOption,
                txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxGrantPeriodicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: PeriodicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const periodicAllowanceData = {
                basic: {
                    spendLimit: this.getCoinType(feegrantOption.basicSpendLimit),
                    expiration: feegrantOption.basicExpiration
                },
                period: { seconds: feegrantOption.periodSeconds, nanos: 0 },
                periodSpendLimit: [{ denom: this.config.denom, amount: feegrantOption.periodSpendLimit.toString() }],
                periodCanSpend: [{ denom: this.config.denom, amount: feegrantOption.periodCanSpend.toString() }],
                periodReset: feegrantOption.periodReset
            };

            const bytes = PeriodicAllowance.encode(periodicAllowanceData).finish();

            const allowanceAnyData = {
                typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                value: bytes
            };

            const message = feeGrantTxClient.msgGrantAllowance({
                granter: address,
                grantee: granteeAddress,
                allowance: Any.fromJSON(allowanceAnyData)
            });

            return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationGrantBasicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: BasicFeeGrantOption = DefaultBasicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxGrantBasicAllowance(wallet,
                granteeAddress,
                feegrantOption,
                txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxGrantBasicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: BasicFeeGrantOption = DefaultBasicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const address = await wallet.getAddress();

            const basicAllowanceData = {
                spendLimit: this.getCoinType(feegrantOption.spendLimit),
                expiration: feegrantOption.expiration
            };

            const bytes = BasicAllowance.encode(basicAllowanceData).finish();

            const allowanceAnyData = {
                typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
                value: bytes
            };

            const message = feeGrantTxClient.msgGrantAllowance({
                granter: address,
                grantee: granteeAddress,
                allowance: Any.fromJSON(allowanceAnyData)
            });

            return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async grantPeriodicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: PeriodicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxGrantPeriodicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await feeGrantTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async grantBasicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: BasicFeeGrantOption = DefaultBasicFeeGrantOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxGrantBasicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await feeGrantTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query
    async getGranteeAllowance(granterAddress: string, granteeAddress: string): Promise<FeeAllowanceType1> {
        try {
            const queryClient = new FeeGrantQueryClient(this.config.restApiAddress);
            const result = await queryClient.getGranteeAllowance(granterAddress, granteeAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGranteeAllowanceAll(granteeAddress: string): Promise<FeeAllowanceType[]> {
        try {
            const queryClient = new FeeGrantQueryClient(this.config.restApiAddress);
            const result = await queryClient.getGranteeAllowanceAll(granteeAddress);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}