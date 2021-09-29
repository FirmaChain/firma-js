import { BankTxClient, BankQueryClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption } from './firmachain/bank';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from './firmachain/common/stargateclient';

export class FirmaBankService {

	constructor(private _config: FirmaConfig) { }

	public async getGasEstimationSend(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxSend(wallet, targetAddress, amount, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxSend(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let bankTxClient = new BankTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const address = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) }

			let message = bankTxClient.msgSend({ fromAddress: address, toAddress: targetAddress, amount: [sendAmount] });

			return await bankTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async send(wallet: FirmaWalletService, targetAddress: string, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxSend(wallet, targetAddress, amount, txMisc);

			let bankTxClient = new BankTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await bankTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getBalance(address: string): Promise<string> {
		try {
			let bankQueryClient = new BankQueryClient(this._config.restApiAddress);
			let result = await bankQueryClient.queryBalance(address, this._config.denom);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}

