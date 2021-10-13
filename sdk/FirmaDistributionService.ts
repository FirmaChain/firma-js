import { DistributionTxClient, DistributionQueryClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption, TotalRewardInfo } from './firmachain/distribution';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from './firmachain/common/stargateclient';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';

export class FirmaDistributionService {

	constructor(private _config: FirmaConfig) { }

	public async getGasEstimationDelegate(wallet: FirmaWalletService, validatorAddres: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxWithdrawAllRewards(wallet, validatorAddres, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxWithdrawAllRewards(wallet: FirmaWalletService, validatorAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			let message = txClient.msgWithdrawDelegatorReward({ delegatorAddress: address, validatorAddress: validatorAddress });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxSetWithdrawAddress(wallet: FirmaWalletService, withdrawAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
		try {
			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			let message = txClient.msgSetWithdrawAddress({ delegatorAddress: address, withdrawAddress: withdrawAddress });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxFundCommunityPool(wallet: FirmaWalletService, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) }

			let message = txClient.msgFundCommunityPool({ depositor: address, amount: [sendAmount] });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxWithdrawValidatorCommission(wallet: FirmaWalletService, validatorAddres: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			let message = txClient.msgWithdrawValidatorCommission({ validatorAddress: validatorAddres });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async setWithdrawAddress(wallet: FirmaWalletService, withdrawAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxSetWithdrawAddress(wallet, withdrawAddress, txMisc);

			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async fundCommunityPool(wallet: FirmaWalletService, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxFundCommunityPool(wallet, amount, txMisc);

			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async withdrawValidatorCommission(wallet: FirmaWalletService, validatorAddres: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxWithdrawValidatorCommission(wallet, validatorAddres, txMisc);

			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async withdrawAllRewards(wallet: FirmaWalletService, validatorAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxWithdrawAllRewards(wallet, validatorAddress, txMisc);

			let txClient = new DistributionTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	// query
	// 

	public async getRewardInfo(address: string, validatorAddress: string): Promise<string> {
		try {
			let queryClient = new DistributionQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetRewardInfo(address, validatorAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getValidatorOutStandingReward(validatorAddress: string): Promise<Coin[]> {
		try {
			let queryClient = new DistributionQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetValidatorOutStandingReward(validatorAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getValidatorCommission(validatorAddress: string): Promise<Coin[]> {
		try {
			let queryClient = new DistributionQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetValidatorCommission(validatorAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getTotalRewardInfo(address: string): Promise<TotalRewardInfo> {
		try {
			let queryClient = new DistributionQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetTotalRewardInfo(address);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getCommunityPool(): Promise<string> {
		try {
			let queryClient = new DistributionQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetCommunityPool();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

}

