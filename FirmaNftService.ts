import { NftTxClient, NftQueryClient, NftItemType, Pagination, TxMisc, DefaultTxMisc, getSignAndBroadcastOption } from './firmachain/nft';
import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { BroadcastTxResponse } from './firmachain/common/stargateclient';

export class NftService {

	constructor(private _config: FirmaConfig) { }

	public async getNftItemAll(paginationKey: string = ""): Promise<{ dataList: NftItemType[], pagination: Pagination }> {
		try {

			let nftQueryClient = new NftQueryClient(this._config.restApiAddress);
			return await nftQueryClient.queryNftItemAll(paginationKey);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getNftItem(nftId: string): Promise<NftItemType> {

		try {
			let nftQueryClient = new NftQueryClient(this._config.restApiAddress);
			let nftItem = await nftQueryClient.queryNftItem(nftId);

			return nftItem;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getNftItemAllFromAddress(ownerAddress: string, paginationKey: string = ""): Promise<{ dataList: NftItemType[], pagination: Pagination }> {

		try {
			const nftTotal = await this.getBalanceOf(ownerAddress);
			const totalPerPage = 100;

			let nftItemList: NftItemType[] = [];
			let nftQueryClient = new NftQueryClient(this._config.restApiAddress);

			let current = 0;
			let nextTarget = nftTotal;
			let nextKey = "";

			if (nftTotal > totalPerPage) {

				if (paginationKey != "")
					current = Number.parseInt(paginationKey);

				nextTarget = current + totalPerPage;

				if (nextTarget >= nftTotal)
					nextTarget = nftTotal;
				else
					nextKey = nextTarget.toString();
			}

			for (let i = current; i < nextTarget; i++) {
				let nftId = await nftQueryClient.queryTokenOfOwnerByIndex(ownerAddress, i.toString());
				let nftItem = await nftQueryClient.queryNftItem(nftId);
				nftItemList.push(nftItem);
			}

			// current가 0일때만 total을 주고, 그외의 index에서는 0을 줌 (cosmos 방식과 동일하게 처리)
			return { dataList: nftItemList, pagination: { next_key: nextKey, total: (current == 0 ? nftTotal : 0) } };

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}

	}

	public async getTokenOfOwnerByIndex(ownerAddress: string, index: number): Promise<NftItemType> {

		try {
			let nftQueryClient = new NftQueryClient(this._config.restApiAddress);
			let nftID = await nftQueryClient.queryTokenOfOwnerByIndex(ownerAddress, index.toString());

			return await nftQueryClient.queryNftItem(nftID);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getBalanceOf(ownerAddress: string): Promise<number> {

		try {
			let nftQueryClient = new NftQueryClient(this._config.restApiAddress);
			let total = await nftQueryClient.queryBalanceOf(ownerAddress);
			return parseInt(total);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationTransfer(wallet: FirmaWalletService, toAddress: string, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxTransfer(wallet, toAddress, nftID, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxTransfer(wallet: FirmaWalletService, toAddress: string, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let address = await wallet.getAddress();

			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			let message = nftTxClient.msgTransfer({ owner: address, toAddress: toAddress, nftId: parseInt(nftID) });
			return await nftTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async transfer(wallet: FirmaWalletService, toAddress: string, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxTransfer(wallet, toAddress, nftID, txMisc);

			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await nftTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationBurn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxBurn(wallet, nftID, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxBurn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let address = await wallet.getAddress();
			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = nftTxClient.msgBurn({ owner: address, nftId: parseInt(nftID) });
			return await nftTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	public async burn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxBurn(wallet, nftID, txMisc);

			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await nftTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getGasEstimationMint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxMint(wallet, tokenURI, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxMint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let address = await wallet.getAddress();

			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = nftTxClient.msgMint({ owner: address, tokenURI: tokenURI });
			return await nftTxClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async mint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {

		try {
			let txRaw = await this.getSignedTxMint(wallet, tokenURI, txMisc);

			let nftTxClient = new NftTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await nftTxClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}

