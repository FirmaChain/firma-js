import { CosmWasmTxClient, CosmWasmQueryClient, TxMisc, CodeInfo, CodeData, ContractInfo, ContractHistoryInfo, ContractStateInfo } from "./firmachain/cosmwasm";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { toUtf8 } from "@cosmjs/encoding";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";

import pako from "pako";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import Long from "long";
import { AccessConfig } from "cosmjs-types/cosmwasm/wasm/v1/types";

export class FirmaCosmWasmService {

    constructor(private readonly config: FirmaConfig) { }

    public getTxClient(wallet: FirmaWalletService): CosmWasmTxClient {
        return new CosmWasmTxClient(wallet, this.config.rpcAddress);
    }

    async getGasEstimationStoreCode(wallet: FirmaWalletService, wasmCode: Uint8Array, accessConfig: AccessConfig, txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxStoreCode(wallet, wasmCode, accessConfig, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async storeCode(wallet: FirmaWalletService, wasmCode: Uint8Array, accessConfig: AccessConfig, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxStoreCode(wallet, wasmCode, accessConfig, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationUpdateAdmin(wallet: FirmaWalletService, contractAddress: string, adminAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxUpdateAdmin(wallet, contractAddress, adminAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async updateAdmin(wallet: FirmaWalletService, contractAddress: string, adminAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxUpdateAdmin(wallet, contractAddress, adminAddress, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationClearAdmin(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxClearAdmin(wallet, contractAddress, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async clearAdmin(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxClearAdmin(wallet, contractAddress, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationMigrateContract(wallet: FirmaWalletService, contractAddress: string, codeId: string, msg: string, txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxMigrateContract(wallet, contractAddress, codeId, msg, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async migrateContract(wallet: FirmaWalletService, contractAddress: string, codeId: string, msg: string, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxMigrateContract(wallet, contractAddress, codeId, msg, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationExecuteContract(wallet: FirmaWalletService, contractAddress: string, msg: string, funds: Coin[] = [], txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxExecuteContract(wallet, contractAddress, msg, funds, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async executeContract(wallet: FirmaWalletService, contractAddress: string, msg: string, funds: Coin[] = [], txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxExecuteContract(wallet, contractAddress, msg, funds, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationInstantiateContract(wallet: FirmaWalletService, admin: string, codeId: string, label: string, msg: string, funds: Coin[], txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxInstantiateContract(wallet, admin, codeId, label, msg, funds, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async instantiateContract(wallet: FirmaWalletService, admin: string, codeId: string, label: string, msg: string, funds: Coin[], txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {
            const txRaw = await this.getSignedTxInstantiateContract(wallet, admin, codeId, label, msg, funds, txMisc);

            const bankTxClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await bankTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxInstantiateContract(wallet: FirmaWalletService, admin: string, codeId: string, label: string, msg: string, funds: Coin[], txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();
            const utfMsg = toUtf8(msg);

            const message = CosmWasmTxClient.msgInstantiateContract({ sender: address, admin: admin, codeId: Long.fromString(codeId), label: label, msg: utfMsg, funds: funds });

            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxUpdateAdmin(wallet: FirmaWalletService, contractAddress: string, adminAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();

            const message = CosmWasmTxClient.msgUpdateAdmin({ sender: address, contract: contractAddress, newAdmin: adminAddress });

            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxClearAdmin(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();
            const message = CosmWasmTxClient.msgClearAdmin({ sender: address, contract: contractAddress });
            
            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxMigrateContract(wallet: FirmaWalletService, contractAddress: string, codeId: string, msg: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();
            const utfMsg = toUtf8(msg);

            const message = CosmWasmTxClient.msgMigrateContract({ sender: address, contract: contractAddress, codeId: Long.fromString(codeId), msg: utfMsg });

            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxExecuteContract(wallet: FirmaWalletService, contractAddress: string, msg: string, funds: Coin[], txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();
            const utfMsg = toUtf8(msg);

            const message = CosmWasmTxClient.msgExecuteContract({ sender: address, contract: contractAddress, msg: utfMsg, funds: funds });

            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxStoreCode(wallet: FirmaWalletService,
        wasmCode: Uint8Array,
        accessConfig: AccessConfig,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {
        try {
            const address = await wallet.getAddress();
            const compressed = pako.gzip(wasmCode, { level: 9 });

            const message = CosmWasmTxClient.msgStoreCode({ sender: address, wasmByteCode: compressed, instantiatePermission: accessConfig });

            const txClient = new CosmWasmTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query
    async getCodeList(): Promise<CodeInfo[]> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getCodeInfoList();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getCodeData(codeId: string): Promise<CodeData> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getCodeData(codeId);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractListFromCodeId(codeId: string): Promise<string[]> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractListFromCodeId(codeId);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractInfo(codeId: string): Promise<ContractInfo> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractInfo(codeId);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractHistory(codeId: string): Promise<ContractHistoryInfo[]> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractHistory(codeId);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractRawQueryData(contractAddress: string, hexString: string): Promise<string> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractRawQueryData(contractAddress, hexString);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractSmartQueryData(contractAddress: string, query: string): Promise<string> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractSmartQueryData(contractAddress, query);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractState(codeId: string): Promise<ContractStateInfo[]> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getContractState(codeId);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getPinnedCodeList(): Promise<string[]> {
        try {
            const queryClient = new CosmWasmQueryClient(this.config.restApiAddress);
            const result = await queryClient.getPinnedCodeList();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}