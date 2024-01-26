import { NftTxClient, NftQueryClient, NftItemType, Pagination, TxMisc } from
    "./firmachain/nft";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { EncodeObject } from "@cosmjs/proto-signing";

export class NftService {

    constructor(private readonly config: FirmaConfig) { }

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

            let result = await this.getNftIdListOfOwner(ownerAddress, paginationKey)

            const nftItemList: NftItemType[] = [];
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);

            for (let i = 0; i < result.nftIdList.length; i++) {
                const nftItem = await nftQueryClient.queryNftItem(result.nftIdList[i]);
                nftItemList.push(nftItem);
            }

            return { dataList: nftItemList, pagination: { next_key: result.pagination.next_key, total: result.pagination.total} };

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }

    }

    async getNftIdListOfOwner(ownerAddress: string, paginationKey: string = ""): Promise<{
        nftIdList: string[],
        pagination: Pagination;
    }> {

        try {
            const nftQueryClient = new NftQueryClient(this.config.restApiAddress);
            return await nftQueryClient.queryNftIdListOfOwner(ownerAddress, paginationKey);

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

    async getUnsignedTxTransfer(wallet: FirmaWalletService,
        toAddress: string,
        nftID: string
        ): Promise<EncodeObject> {

        try {
            const address = await wallet.getAddress();
            const message = NftTxClient.msgTransfer({ owner: address, toAddress, nftId: parseInt(nftID) });

            return message;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getSignedTxTransfer(wallet: FirmaWalletService,
        toAddress: string,
        nftID: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const message = await this.getUnsignedTxTransfer(wallet, toAddress, nftID);

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
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

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
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

    async getUnsignedTxBurn(wallet: FirmaWalletService, nftID: string): Promise<EncodeObject> {
            
            try {
                const address = await wallet.getAddress();
                const message = NftTxClient.msgBurn({ owner: address, nftId: parseInt(nftID) });
    
                return message;
    
            } catch (error) {
                FirmaUtil.printLog(error);
                throw error;
            }
        }

    async getSignedTxBurn(wallet: FirmaWalletService, nftID: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const message = await this.getUnsignedTxBurn(wallet, nftID);

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
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

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationFromEncodeObject(wallet: FirmaWalletService, msgList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
            const txRaw = await nftTxClient.sign(msgList, getSignAndBroadcastOption(this.config.denom, txMisc));

            return await FirmaUtil.estimateGas(txRaw);

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

    async getSignedTxMint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const message = await this.getUnsignedTxMint(wallet, tokenURI);

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getUnsignedTxMint(wallet: FirmaWalletService, tokenURI: string): Promise<EncodeObject> {
            
            try {
                const address = await wallet.getAddress();
                const message = NftTxClient.msgMint({ owner: address, tokenURI: tokenURI });
    
                return message;
    
            } catch (error) {
                FirmaUtil.printLog(error);
                throw error;
            }
        }
    
    async mint(wallet: FirmaWalletService, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxMint(wallet, tokenURI, txMisc);

            const nftTxClient = new NftTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async signAndBroadcast(wallet: FirmaWalletService, msgList: EncodeObject[], txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const contractTxClient = new NftTxClient(wallet, this.config.rpcAddress);
            return await contractTxClient.signAndBroadcast(msgList,
                getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}