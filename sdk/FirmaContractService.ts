import { ContractTxClient, ContractQueryClient, ContractLogType, ContractFileType, Pagination, TxMisc, DefaultTxMisc, getSignAndBroadcastOption } from './firmachain/contract';

import { EncodeObject } from '@cosmjs/proto-signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from './firmachain/common/stargateclient';

export class ContractService {

	constructor(private _config: FirmaConfig) { }

	public async getContractLogAll(paginationKey: string = ""): Promise<{ dataList: ContractLogType[], pagination: Pagination }> {

		try {
			let contractQueryClient = new ContractQueryClient(this._config.restApiAddress);
			return await contractQueryClient.queryContractLogAll(paginationKey);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getContractFileAll(paginationKey: string = ""): Promise<{ dataList: ContractFileType[], pagination: Pagination }> {
		try {
			let contractQueryClient = new ContractQueryClient(this._config.restApiAddress);
			return await contractQueryClient.queryContractFileAll(paginationKey);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getContractFile(fileHash: string): Promise<ContractFileType> {
		try {
			let contractQueryClient = new ContractQueryClient(this._config.restApiAddress);
			return await contractQueryClient.queryContractFile(fileHash);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async isContractOwner(fileHash: string, ownerAddress: string): Promise<boolean> {
		try {
			let contractQueryClient = new ContractQueryClient(this._config.restApiAddress);
			return await contractQueryClient.queryIsContractOwner(fileHash, ownerAddress);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getContractLog(logId: string): Promise<ContractLogType> {
		try {
			let contractQueryClient = new ContractQueryClient(this._config.restApiAddress);
			return await contractQueryClient.queryContractLog(logId);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationFromUnSignedTxList(wallet: FirmaWalletService, txList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			var txRaw = await contractTxClient.sign(txList, getSignAndBroadcastOption(this._config.denom, txMisc));
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationCreateContractFile(wallet: FirmaWalletService, fileHash: string, timeStamp: number, ownerList: string[], metaDataJsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxCreateContractFile(wallet, fileHash, timeStamp, ownerList, metaDataJsonString, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getUnsignedTxCreateContractFile(wallet: FirmaWalletService, fileHash: string, timeStamp: number, ownerList: string[], metaDataJsonString: string): Promise<EncodeObject> {

		try {
			let address = await wallet.getAddress();
			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			return contractTxClient.msgCreateContractFile({
				creator: address,
				fileHash: fileHash,
				timeStamp: timeStamp,
				ownerList: ownerList,
				metaDataJsonString: metaDataJsonString
			});
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxCreateContractFile(wallet: FirmaWalletService, fileHash: string, timeStamp: number, ownerList: string[], metaDataJsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let address = await wallet.getAddress();

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = contractTxClient.msgCreateContractFile({
				creator: address,
				fileHash: fileHash,
				timeStamp: timeStamp,
				ownerList: ownerList,
				metaDataJsonString: metaDataJsonString
			});

			return await contractTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async createContractFile(wallet: FirmaWalletService, fileHash: string, timeStamp: number, ownerList: string[], metaDataJsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let txRaw = await this.getSignedTxCreateContractFile(wallet, fileHash, timeStamp, ownerList, metaDataJsonString, txMisc);

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await contractTxClient.broadcast(txRaw);
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationAddContractLog(wallet: FirmaWalletService, contractHash: string, timeStamp: number, eventName: string, ownerAddress: string, jsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxAddContractLog(wallet: FirmaWalletService, contractHash: string, timeStamp: number, eventName: string, ownerAddress: string, jsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let address = await wallet.getAddress();

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = contractTxClient.msgAddContractLog({
				creator: address,
				contractHash: contractHash,
				timeStamp: timeStamp,
				eventName: eventName,
				ownerAddress: ownerAddress,
				jsonString: jsonString
			});

			return await contractTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async addContractLog(wallet: FirmaWalletService, contractHash: string, timeStamp: number, eventName: string, ownerAddress: string, jsonString: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString, txMisc);

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await contractTxClient.broadcast(txRaw);
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getUnsignedTxAddContractLog(wallet: FirmaWalletService, contractHash: string, timeStamp: number, eventName: string, ownerAddress: string, jsonString: string): Promise<EncodeObject> {

		try {
			let address = await wallet.getAddress();

			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			return contractTxClient.msgAddContractLog({
				creator: address,
				contractHash: contractHash,
				timeStamp: timeStamp,
				eventName: eventName,
				ownerAddress: ownerAddress,
				jsonString: jsonString
			});

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async signAndBroadcast(wallet: FirmaWalletService, msgList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let contractTxClient = new ContractTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await contractTxClient.signAndBroadcast(msgList, getSignAndBroadcastOption(this._config.denom, txMisc));
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}
