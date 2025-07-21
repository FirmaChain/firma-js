import {
    FeeGrantTxClient,
    TxMisc,
} from "./firmachain/feegrant";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { FeeAllowanceType, FeeAllowanceType1, FeeGrantQueryClient } from "./firmachain/feegrant/FeeGrantQueryClient";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Any } from "./firmachain/google/protobuf/any";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { BasicAllowance, PeriodicAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";

export class FirmaFeeGrantService {

    constructor(private readonly config: FirmaConfig) { }

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

            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);
            const message = FeeGrantTxClient.msgRevokeAllowance({ granter: address, grantee: granteeAddress });

            return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async revokeAllowance(wallet: FirmaWalletService, granteeAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {

        try {
            const txRaw = await this.getSignedTxRevokeAllowance(wallet, granteeAddress, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);
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
        feegrantOption: PeriodicAllowance,
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
        feegrantOption: PeriodicAllowance,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);

            const bytes = PeriodicAllowance.encode(feegrantOption).finish();

            const allowanceAnyData = {
                typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                value: bytes
            };

            const message = FeeGrantTxClient.msgGrantAllowance({
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
        feegrantOption: BasicAllowance,
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
        feegrantOption: BasicAllowance,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);
            
            const address = await wallet.getAddress();
            const bytes = BasicAllowance.encode(feegrantOption).finish();
            const allowanceAnyData = {
                typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
                value: bytes
            };

            const message = FeeGrantTxClient.msgGrantAllowance({
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
        feegrantOption: PeriodicAllowance,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {

        try {
            const txRaw = await this.getSignedTxGrantPeriodicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);
            return await feeGrantTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async grantBasicAllowance(wallet: FirmaWalletService,
        granteeAddress: string,
        feegrantOption: BasicAllowance,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxGrantBasicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

            const feeGrantTxClient = new FeeGrantTxClient(wallet, this.config.rpcAddress);
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