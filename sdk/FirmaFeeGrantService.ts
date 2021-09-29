import { FeeGrantTxClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption, DefaultBasicFeeGrantOption, BasicFeeGrantOption, PeriodicFeeGrantOption } from './firmachain/feegrant';
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { BasicAllowance, PeriodicAllowance } from './firmachain/feegrant/FeeGrantTxTypes';
import { FeeAllowanceType, FeeAllowanceType1, FeeGrantQueryClient } from './firmachain/feegrant/FeeGrantQueryClient';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { BroadcastTxResponse } from './firmachain/common/stargateclient';

export class FirmaFeeGrantService {

	constructor(private _config: FirmaConfig) { }

	private async getSignedTxRevokeAllowance(wallet: FirmaWalletService, granteeAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			const address = await wallet.getAddress();

			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			let message = feeGrantTxClient.msgRevokeAllowance({ granter: address, grantee: granteeAddress });

			return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async RevokeAllowance(wallet: FirmaWalletService, granteeAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxRevokeAllowance(wallet, granteeAddress, txMisc);

			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await feeGrantTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private getCoinType(amount?: number): Coin[] {

		if (amount == undefined)
			return [];

		return [{ denom: this._config.denom, amount: amount!.toString() }]
	}


	private async getSignedTxGrantPeriodicAllowance(wallet: FirmaWalletService, granteeAddress: string, feegrantOption: PeriodicFeeGrantOption, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			const address = await wallet.getAddress();

			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let periodicAllowanceData = {
				basic: {
					spendLimit: this.getCoinType(feegrantOption.basicSpendLimit),
					expiration: feegrantOption.basicExpiration
				},
				period: { seconds: feegrantOption.periodSeconds, nanos: 0 },
				periodSpendLimit: [{ denom: this._config.denom, amount: feegrantOption.periodSpendLimit.toString() }],
				periodCanSpend: [{ denom: this._config.denom, amount: feegrantOption.periodCanSpend.toString() }],
				periodReset: feegrantOption.periodReset
			};

			const bytes = PeriodicAllowance.encode(periodicAllowanceData).finish();

			let allowanceAnyData = {
				typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
				value: bytes
			};

			let message = feeGrantTxClient.msgGrantAllowance({ granter: address, grantee: granteeAddress, allowance: Any.fromJSON(allowanceAnyData) });

			return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxGrantBasicAllowance(wallet: FirmaWalletService, granteeAddress: string, feegrantOption: BasicFeeGrantOption = DefaultBasicFeeGrantOption, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();

			let basicAllowanceData = {
				spendLimit: this.getCoinType(feegrantOption.spendLimit),
				expiration: feegrantOption.expiration
			};

			const bytes = BasicAllowance.encode(basicAllowanceData).finish();

			let allowanceAnyData = {
				typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
				value: bytes
			};

			let message = feeGrantTxClient.msgGrantAllowance({ granter: address, grantee: granteeAddress, allowance: Any.fromJSON(allowanceAnyData) });

			return await feeGrantTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async GrantPeriodicAllowance(wallet: FirmaWalletService, granteeAddress: string, feegrantOption: PeriodicFeeGrantOption, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxGrantPeriodicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await feeGrantTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	public async GrantBasicAllowance(wallet: FirmaWalletService, granteeAddress: string, feegrantOption: BasicFeeGrantOption = DefaultBasicFeeGrantOption, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxGrantBasicAllowance(wallet, granteeAddress, feegrantOption, txMisc);

			let feeGrantTxClient = new FeeGrantTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await feeGrantTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	// query
	public async getGranteeAllowance(granterAddress: string, granteeAddress: string): Promise<FeeAllowanceType1> {
		try {
			let queryClient = new FeeGrantQueryClient(this._config.restApiAddress);
			let result = await queryClient.getGranteeAllowance(granterAddress, granteeAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGranteeAllowanceAll(granteeAddress: string): Promise<FeeAllowanceType[]> {
		try {
			let queryClient = new FeeGrantQueryClient(this._config.restApiAddress);
			let result = await queryClient.getGranteeAllowanceAll(granteeAddress);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}

