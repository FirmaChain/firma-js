import { TokenTxClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption, TokenDataType, TokenQueryClient, Pagination } from "./firmachain/token";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

export class TokenService {

    constructor(private readonly config: FirmaConfig) { }

    async getGasEstimationCreateToken(wallet: FirmaWalletService, tokenName: string, tokenSymbol: string, tokenURI: string, totalSupply: number, decimal: number, isMintable: boolean, isBurnable: boolean, txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const newTotalSupply = FirmaUtil.getUTokenFromToken(totalSupply, decimal);

            const txRaw = await this.getSignedTxCreateToken(wallet, tokenName, tokenSymbol, tokenURI, newTotalSupply, decimal, isMintable, isBurnable, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationMint(wallet: FirmaWalletService, tokenID: string, amount: number, decimal: number, toAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<number> {

        try {
            const newAmount = FirmaUtil.getUTokenFromToken(amount, decimal);
            const txRaw = await this.getSignedTxMint(wallet, tokenID, amount, toAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, tokenID: string, amount: number, decimal: number, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const newAmount = FirmaUtil.getUTokenFromToken(amount, decimal);
            const txRaw = await this.getSignedTxBurn(wallet, tokenID, newAmount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationUpdateTokenURI(wallet: FirmaWalletService, tokenID: string, tokenURI: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxUpdateTokenURI(wallet, tokenID, tokenURI, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxUpdateTokenURI(wallet: FirmaWalletService, tokenID: string, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const txClient = new TokenTxClient(wallet, this.config.rpcAddress);

            const message = txClient.msgUpdateTokenURI({
                owner: address,
                tokenID: tokenID,
                tokenURI: tokenURI
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxBurn(wallet: FirmaWalletService, tokenID: string, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const txClient = new TokenTxClient(wallet, this.config.rpcAddress);

            const message = txClient.msgBurn({
                owner: address,
                tokenID: tokenID,
                amount: amount
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxMint(wallet: FirmaWalletService, tokenID: string, amount: number, toAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const txClient = new TokenTxClient(wallet, this.config.rpcAddress);

            const message = txClient.msgMint({
                owner: address,
                tokenID: tokenID,
                amount: amount,
                toAddress: toAddress
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxCreateToken(wallet: FirmaWalletService, tokenName: string, tokenSymbol: string, tokenURI: string, totalSupply: number, decimal: number, isMintable: boolean, isBurnable: boolean, txMisc: TxMisc = DefaultTxMisc):
        Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const txClient = new TokenTxClient(wallet, this.config.rpcAddress);

            const message = txClient.msgCreateToken({
                owner: address,
                name: tokenName,
                symbol: tokenSymbol,
                tokenURI: tokenURI,
                totalSupply: totalSupply,
                decimal: decimal,
                mintable: isMintable,
                burnable: isBurnable
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    //./firmachaind tx token mint ukai 1000000 firma1jmg3kwy5hntx66nl93dyk2d92943394qsf6gcf  --from alice --fees 2000ufct --chain-id imperium-2

    async createToken(wallet: FirmaWalletService, tokenName: string, tokenSymbol: string, tokenURI: string, totalSupply: number, decimal: number, isMintable: boolean, isBurnable: boolean, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {

            const newTotalSupply = FirmaUtil.getUTokenFromToken(totalSupply, decimal);
            const txRaw = await this.getSignedTxCreateToken(wallet, tokenName, tokenSymbol, tokenURI, newTotalSupply, decimal, isMintable, isBurnable, txMisc);

            const nftTxClient = new TokenTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async mint(wallet: FirmaWalletService, tokenID: string, amount: number, decimal: number, toAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const newAmount = FirmaUtil.getUTokenFromToken(amount, decimal);
            const txRaw = await this.getSignedTxMint(wallet, tokenID, newAmount, toAddress, txMisc);

            const nftTxClient = new TokenTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async burn(wallet: FirmaWalletService, tokenID: string, amount: number, decimal: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const newAmount = FirmaUtil.getUTokenFromToken(amount, decimal);
            const txRaw = await this.getSignedTxBurn(wallet, tokenID, newAmount, txMisc);

            const nftTxClient = new TokenTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async updateTokenURI(wallet: FirmaWalletService, tokenID: string, tokenURI: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {

        try {
            const txRaw = await this.getSignedTxUpdateTokenURI(wallet, tokenID, tokenURI, txMisc);

            const nftTxClient = new TokenTxClient(wallet, this.config.rpcAddress);
            return await nftTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    //  query
    async getGetTokenDataAll(paginationKey: string = ""): Promise<{ dataList: TokenDataType[], pagination: Pagination }> {
        try {

            const queryClient = new TokenQueryClient(this.config.restApiAddress);
            return await queryClient.queryTokenDataAll(paginationKey);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTokenData(tokenID: string): Promise<TokenDataType> {

        try {
            const queryClient = new TokenQueryClient(this.config.restApiAddress);
            const tokenData = await queryClient.queryTokenData(tokenID);

            return tokenData;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTokenDataListFromOwner(ownerAddress: string): Promise<string[]> {

        try {
            const queryClient = new TokenQueryClient(this.config.restApiAddress);
            const tokenData = await queryClient.queryTokenDataFromOwner(ownerAddress);

            return tokenData;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}