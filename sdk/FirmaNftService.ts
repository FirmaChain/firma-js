import { NftTxClient, NftQueryClient, NftItemType, Pagination, TxMisc, DefaultTxMisc, getSignAndBroadcastOption } from
    "./firmachain/nft";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export class NftService {

    constructor(private readonly config: FirmaConfig) {}

    async getNftItemAll(paginationKey: string = ""): Promise<{ dataList: NftItemType[], pagination: Pagination }> {
        try {

            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);
            return await nftQueryClient.queryNftItemAll(paginationKey);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftItem(nftId: string): Promise<NftItemType> {

        try {
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);
            const nftItem = await nftQueryClient.queryNftItem(nftId);

            return nftItem;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftItemAllFromAddress(ownerAddress: string, paginationKey: string = ""): Promise<{
        dataList: NftItemType[],
        pagination: Pagination;
    }> {

        try {
            const nftTotal = await this.getBalanceOf(ownerAddress);
            const totalPerPage = 100;

            const nftItemList: NftItemType[] = [];
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);

            let current = 0;
            let nextTarget = nftTotal;
            let nextKey = "";

            if (nftTotal > totalPerPage) {

                if (paginationKey !== "")
                    current = Number.parseInt(paginationKey);

                nextTarget = current + totalPerPage;

                if (nextTarget >= nftTotal)
                    nextTarget = nftTotal;
                else
                    nextKey = nextTarget.toString();
            }

            for (let i = current; i < nextTarget; i++) {
                const nftId = await nftQueryClient.queryTokenOfOwnerByIndex(ownerAddress, i.toString());
                const nftItem = await nftQueryClient.queryNftItem(nftId);
                nftItemList.push(nftItem);
            }

            return { dataList: nftItemList, pagination: { next_key: nextKey, total: (current === 0 ? nftTotal : 0) } };

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }

    }

    async getTokenOfOwnerByIndex(ownerAddress: string, index: number): Promise<NftItemType> {

        try {
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);
            const nftID = await nftQueryClient.queryTokenOfOwnerByIndex(ownerAddress, index.toString());

            return await nftQueryClient.queryNftItem(nftID);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getBalanceOf(ownerAddress: string): Promise<number> {

        try {
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);
            const total = await nftQueryClient.queryBalanceOf(ownerAddress);
            return parseInt(total);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationTransfer(wallet: FirmaWalletService,
        toAddress: string,
        nftID: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxTransfer(wallet, toAddress, nftID, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxTransfer(wallet: FirmaWalletService,
        toAddress: string,
        nftID: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            const message = nftTxClient.msgTransfer({ owner: address, toAddress: toAddress, nftId: parseInt(nftID) });
            return await nftTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async transfer(wallet: FirmaWalletService, toAddress: string, nftID: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxTransfer(wallet, toAddress, nftID, txMisc);

            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxBurn(wallet, nftID, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxBurn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();
            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = nftTxClient.msgBurn({ owner: address, nftId: parseInt(nftID) });
            return await nftTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async burn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxBurn(wallet, nftID, txMisc);

            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationMint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const txRaw = await this.getSignedTxMint(wallet, tokenURI, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxMint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = nftTxClient.msgMint({ owner: address, tokenURI: tokenURI });
            return await nftTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async mint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxMint(wallet, tokenURI, txMisc);

            const nftTxClient = new NftTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}