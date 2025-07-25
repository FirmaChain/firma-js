import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { Any } from "./firmachain/google/protobuf/any";
import { AuthzQueryClient, AuthzTxClient, GrantGenericData, GrantSendData, GrantStakingData, Pagination, TxMisc } from "./firmachain/authz";
import { AuthorizationType, SendAuthorization, GenericAuthorization, StakeAuthorization } from "./firmachain/authz/AuthzTxTypes";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";

export class FirmaAuthzService {
    constructor(private readonly config: FirmaConfig) { }

    private async getSignedTxGrantSendAutorization(wallet: FirmaWalletService,
        granteeAddress: string,
        maxTokens: string,
        expirationDate: Timestamp,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const authorization = Any.fromPartial({
                typeUrl: "/cosmos.bank.v1beta1.SendAuthorization",
                value: Uint8Array.from(SendAuthorization.encode(SendAuthorization.fromPartial({
                    spendLimit: [{ denom: this.config.denom, amount: maxTokens }],
                })).finish()),
            });

            const message = AuthzTxClient.msgGrantAllowance({
                granter: address,
                grantee: granteeAddress,
                grant: {
                    authorization: authorization,
                    expiration: expirationDate
                }
            });

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
        
    private async getSignedTxGrantStakeAutorization(wallet: FirmaWalletService,
        granteeAddress: string,
        validatorAddressList: string[],
        type: AuthorizationType,
        maxTokens: string,
        expirationDate: Timestamp,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const authorization = Any.fromPartial({
                typeUrl: "/cosmos.staking.v1beta1.StakeAuthorization",
                value: Uint8Array.from(StakeAuthorization.encode(StakeAuthorization.fromPartial({
                    allowList: { address: validatorAddressList },
                    maxTokens: (maxTokens === "0") ? undefined : { denom: this.config.denom, amount: maxTokens },
                    authorizationType: type
                })).finish()),
            });

            const message = AuthzTxClient.msgGrantAllowance({
                granter: address,
                grantee: granteeAddress,
                grant: {
                    authorization: authorization,
                    expiration: expirationDate
                }
            });

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxGrantGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msgType: string,
        expirationDate: Timestamp,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const authorization = Any.fromPartial({
                typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
                value: Uint8Array.from(GenericAuthorization.encode(GenericAuthorization.fromPartial({
                    msg: msgType
                })).finish()),
            });

            const message = AuthzTxClient.msgGrantAllowance({
                granter: address,
                grantee: granteeAddress,
                grant: {
                    authorization: authorization,
                    expiration: expirationDate
                }
            });

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);        
            return await authzTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxRevokeGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msgType: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const message = AuthzTxClient.msgRevokeAllowance({
                granter: address,
                grantee: granteeAddress,
                msgTypeUrl: msgType
            });

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // executeAllowance
    private async getSignedTxExecuteAllowance(wallet: FirmaWalletService,
        msgs: Any[],
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const address = await wallet.getAddress();

            const message = AuthzTxClient.msgExecAllowance({
                grantee: address,
                msgs: msgs
            });

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationGrantSendAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        expirationDate: Timestamp,
        maxTokens: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxGrantSendAutorization(wallet, granteeAddress, FirmaUtil.getUFCTStringFromFCT(maxTokens), expirationDate, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async grantSendAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        expirationDate: Timestamp,
        maxTokens: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxGrantSendAutorization(wallet, granteeAddress, FirmaUtil.getUFCTStringFromFCT(maxTokens), expirationDate, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationGrantStakeAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        validatorAddressList: string[],
        type: AuthorizationType,
        expirationDate: Timestamp,
        maxTokens: number = 0,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxGrantStakeAutorization(wallet, granteeAddress, validatorAddressList, type, FirmaUtil.getUFCTStringFromFCT(maxTokens), expirationDate, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async grantStakeAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        validatorAddressList: string[],
        type: AuthorizationType,
        expirationDate: Timestamp,
        maxTokens: number = 0,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxGrantStakeAutorization(wallet, granteeAddress, validatorAddressList, type, FirmaUtil.getUFCTStringFromFCT(maxTokens), expirationDate, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationGrantGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msg: string,
        expirationDate: Timestamp,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxGrantGenericAuthorization(wallet, granteeAddress, msg, expirationDate, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async grantGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msg: string,
        expirationDate: Timestamp,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxGrantGenericAuthorization(wallet, granteeAddress, msg, expirationDate, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationRevokeGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msgType: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxRevokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async revokeGenericAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        msgType: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxRevokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationRevokeSendAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const msgType = "/cosmos.bank.v1beta1.MsgSend";

            const txRaw = await this.getSignedTxRevokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async revokeSendAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {

            const msgType = "/cosmos.bank.v1beta1.MsgSend";
            return await this.revokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationRevokeStakeAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        type: AuthorizationType,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            let msgType = "";

            switch (type) {
                case AuthorizationType.AUTHORIZATION_TYPE_DELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgDelegate";
                    break;
                case AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgUndelegate";
                    break;
                case AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
                    break;

                default:
                    throw "AuthorizationType Error : " + type;
            }

            const txRaw = await this.getSignedTxRevokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async revokeStakeAuthorization(wallet: FirmaWalletService,
        granteeAddress: string,
        type: AuthorizationType,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {

            let msgType = "";

            switch (type) {
                case AuthorizationType.AUTHORIZATION_TYPE_DELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgDelegate";
                    break;
                case AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgUndelegate";
                    break;
                case AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE:
                    msgType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
                    break;

                default:
                    throw "AuthorizationType Error : " + type;
            }

            const txRaw = await this.getSignedTxRevokeGenericAuthorization(wallet, granteeAddress, msgType, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationExecuteAllowance(wallet: FirmaWalletService,
        msgs: Any[],
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        try {
            const txRaw = await this.getSignedTxExecuteAllowance(wallet, msgs, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async executeAllowance(wallet: FirmaWalletService,
        msgs: Any[],
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxExecuteAllowance(wallet, msgs, txMisc);

            const authzTxClient = new AuthzTxClient(wallet, this.config.rpcAddress);
            return await authzTxClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // query
    async getSendGrantData(granterAddress: string, granteeAddress: string, paginationKey: string = ""): Promise<{ dataList:GrantSendData[], pagination: Pagination }> {
        try {
            const queryClient = new AuthzQueryClient(this.config.restApiAddress);
            const result = await queryClient.getSendGrantData(granterAddress, granteeAddress, paginationKey);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGenericGrantData(granterAddress: string, granteeAddress: string, msgType: string, paginationKey: string = ""): Promise<{ dataList:GrantGenericData[], pagination: Pagination }> {
        try {
            const queryClient = new AuthzQueryClient(this.config.restApiAddress);
            const result = await queryClient.getGenericGrantData(granterAddress, granteeAddress, msgType, paginationKey);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getStakingGrantData(granterAddress: string, granteeAddress: string, msgType: AuthorizationType, paginationKey: string = ""): Promise<{ dataList:GrantStakingData[], pagination: Pagination }> {
        try {
            const queryClient = new AuthzQueryClient(this.config.restApiAddress);
            const result = await queryClient.getStakingGrantData(granterAddress, granteeAddress, msgType, paginationKey);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}