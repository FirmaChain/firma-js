import { StakingTxClient, StakingQueryClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption, ValidatorDataType, PoolDataType, ParamsDataType, DelegationInfo, RedelegationInfo, UndelegationInfo } from './firmachain/staking';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from './firmachain/common/stargateclient';
import { Description } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { MsgCreateValidator } from 'cosmjs-types/cosmos/staking/v1beta1/tx';

export class FirmaStakingService {

	constructor(private _config: FirmaConfig) { }

	public async getGasEstimationDelegate(wallet: FirmaWalletService, validatorAddres: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxDelegate(wallet, validatorAddres, amount, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationUndelegate(wallet: FirmaWalletService, validatorAddres: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxUndelegate(wallet, validatorAddres, amount, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxDelegate(wallet: FirmaWalletService, validatorAddres: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) }

			let message = txClient.msgDelegate({ delegatorAddress: address, validatorAddress: validatorAddres, amount: sendAmount });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxUndelegate(wallet: FirmaWalletService, validatorAddres: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) }

			let message = txClient.msgUndelegate({ delegatorAddress: address, validatorAddress: validatorAddres, amount: sendAmount });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxRedelegate(wallet: FirmaWalletService, validatorSrcAddress: string, validatorDstAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) }

			let message = txClient.msgRedelegate({
				delegatorAddress: address, validatorSrcAddress: validatorSrcAddress,
				validatorDstAddress: validatorDstAddress, amount: sendAmount
			});

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxCreateValidator(wallet: FirmaWalletService, validatorInfo: MsgCreateValidator, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = txClient.msgCreateValidator({
				description: validatorInfo.description, commission: validatorInfo.commission,
				minSelfDelegation: validatorInfo.minSelfDelegation, delegatorAddress: validatorInfo.delegatorAddress,
				validatorAddress: validatorInfo.validatorAddress, pubkey: validatorInfo.pubkey, value: validatorInfo.value
			});

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxEditValidator(wallet: FirmaWalletService, validatorAddress: string, description: Description, commissionRate: string, minSelfDelegation: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = txClient.msgEditValidator({
				validatorAddress: validatorAddress, description: description,
				commissionRate: commissionRate, minSelfDelegation: minSelfDelegation
			});

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async createValidator(wallet: FirmaWalletService, validatorInfo: MsgCreateValidator, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxCreateValidator(wallet, validatorInfo, txMisc);

			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async editValidator(wallet: FirmaWalletService, validatorAddress: string, description: Description, commissionRate: string, minSelfDelegation: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxEditValidator(wallet, validatorAddress, description, commissionRate, minSelfDelegation, txMisc);

			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	public async redelegate(wallet: FirmaWalletService, validatorSrcAddress: string, validatorDstAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxRedelegate(wallet, validatorSrcAddress, validatorDstAddress, amount, txMisc);

			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async undelegate(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxUndelegate(wallet, targetAddress, amount, txMisc);

			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async delegate(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxDelegate(wallet, targetAddress, amount, txMisc);

			let txClient = new StakingTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	// query

	public async getUndelegationInfoFromValidator(address: string, validatorAddress: string): Promise<UndelegationInfo> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetUndelegationInfoFromValidator(address, validatorAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getDelegationInfoFromValidator(address: string, validatorAddress: string): Promise<DelegationInfo> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetDelegationInfoFromValidator(address, validatorAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getTotalUndelegateInfo(address: string): Promise<UndelegationInfo[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetTotalUndelegateInfo(address);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getTotalRedelegationInfo(address: string): Promise<RedelegationInfo[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.querygetTotalRedelegationInfo(address);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getUndelegationListFromValidator(valoperAddress: string): Promise<UndelegationInfo[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetUndelegationListFromValidator(valoperAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getDelegationListFromValidator(valoperAddress: string): Promise<DelegationInfo[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetDelegateListFromValidator(valoperAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getTotalDelegationInfo(address: string): Promise<DelegationInfo[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetTotalDelegationInfo(address);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getParams(): Promise<ParamsDataType> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetParams();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getPool(): Promise<PoolDataType> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetPool();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getValidator(valoperAddress: string): Promise<ValidatorDataType> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryValidator(valoperAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getValidatorList(): Promise<ValidatorDataType[]> {
		try {
			let queryClient = new StakingQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryValidators();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

}

