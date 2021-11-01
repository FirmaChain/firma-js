import {
    GovTxClient,
    GovQueryClient,
    TxMisc,
    DefaultTxMisc,
    getSignAndBroadcastOption,
    ParamChangeOption,
    SoftwareUpgradePlan,
    VotingOption,
    ProposalInfo,
    ProposalStatus,
    ProposalParam,
    CurrentVoteInfo
} from "./firmachain/gov";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from "./firmachain/common/stargateclient";
import { Any } from "./firmachain/google/protobuf/any";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { CancelSoftwareUpgradeProposal, SoftwareUpgradeProposal } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";

import Long from "long";

export class FirmaGovService {

    constructor(private readonly config: FirmaConfig) { }

    async getGasEstimationVote(wallet: FirmaWalletService,
        proposalId: number,
        option: VotingOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const longId = Long.fromInt(proposalId);

            const txRaw = await this.getSignedTxVote(wallet, longId, option, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationDeposit(wallet: FirmaWalletService,
        proposalId: number,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const longId = Long.fromInt(proposalId);

            const txRaw = await this.getSignedTxDeposit(wallet, longId, amount, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitCancelSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSubmitCancelSoftwareUpgradeProposal(wallet, title, description, initialDepositFCT, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitSoftwareUpgradeProposalByHeight(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        upgradeName: string,
        height: Long,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {

            const plan = {
                name: upgradeName,
                time: undefined as any,
                height: height,
                info: undefined as any,
                upgradedClientState: undefined as any
            };


            const txRaw = await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, description, initialDepositFCT, plan, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitParameterChangeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        paramList: ParamChangeOption[],
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSubmitParameterChangeProposal(wallet, title, description, initialDepositFCT, paramList, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        amount: number,
        recipient: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSubmitCommunityPoolSpendProposal(wallet, title, description, initialDepositFCT, amount, recipient, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitTextProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const txRaw = await this.getSignedTxSubmitTextProposal(wallet, title, description, initialDepositFCT, txMisc);
            return await FirmaUtil.estimateGas(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitTextProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };

            const proposal = TextProposal.fromPartial({
                title: title,
                description: description,
            });

            const content = Any.fromPartial({
                typeUrl: "/cosmos.gov.v1beta1.TextProposal",
                value: Uint8Array.from(TextProposal.encode(proposal).finish()),
            });

            const proposer = await wallet.getAddress();
            const message =
                txClient.msgSubmitProposal({ content: content, initialDeposit: [sendAmount], proposer: proposer });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitCancelSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const initialDepositAmount = {
                denom: this.config.denom,
                amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT)
            };

            const proposal = CancelSoftwareUpgradeProposal.fromPartial({
                title: title,
                description: description,
            });

            const content = Any.fromPartial({
                typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
                value: Uint8Array.from(SoftwareUpgradeProposal.encode(proposal).finish()),
            });

            const proposer = await wallet.getAddress();
            const message = txClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        plan: SoftwareUpgradePlan,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const initialDepositAmount = {
                denom: this.config.denom,
                amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT)
            };

            const proposal = SoftwareUpgradeProposal.fromPartial({
                title: title,
                description: description,
                plan: plan,
            });

            const content = Any.fromPartial({
                typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
                value: Uint8Array.from(SoftwareUpgradeProposal.encode(proposal).finish()),
            });

            const proposer = await wallet.getAddress();
            const message = txClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitParameterChangeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        paramList: ParamChangeOption[],
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const initialDepositAmount = {
                denom: this.config.denom,
                amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT)
            };

            const proposal = ParameterChangeProposal.fromPartial({
                title: title,
                description: description,
                changes: paramList,
            });

            const content = Any.fromPartial({
                typeUrl: "/cosmos.params.v1beta1.ParameterChangeProposal",
                value: Uint8Array.from(ParameterChangeProposal.encode(proposal).finish()),
            });

            const proposer = await wallet.getAddress();
            const message = txClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDepositFCT: number,
        amount: number,
        recipient: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const initialDepositAmount = {
                denom: this.config.denom,
                amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT)
            };
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

            const proposal = CommunityPoolSpendProposal.fromPartial({
                title: title,
                description: description,
                recipient: recipient,
                amount: [sendAmount]
            });

            const content = Any.fromPartial({
                typeUrl: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
                value: Uint8Array.from(CommunityPoolSpendProposal.encode(proposal).finish()),
            });

            const proposer = await wallet.getAddress();
            const message = txClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitCancelSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {

            const txRaw =
                await this.getSignedTxSubmitCancelSoftwareUpgradeProposal(wallet, title, description, initialDeposit, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitSoftwareUpgradeProposalByHeight(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        upgradeName: string,
        height: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {

            const upgradeHeight = Long.fromInt(height);

            const plan = {
                name: upgradeName,
                time: undefined as any,
                height: upgradeHeight,
                info: undefined as any,
                upgradedClientState: undefined as any
            };

            const txRaw =
                await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, description, initialDeposit, plan, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitSoftwareUpgradeProposalByTime(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        upgradeName: string,
        upgradeTime: Date,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {
            const plan = {
                name: upgradeName,
                time: upgradeTime,
                height: undefined as any,
                info: undefined as any,
                upgradedClientState: undefined as any
            };

            const txRaw =
                await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, description, initialDeposit, plan, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async submitParameterChangeProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        paramList: ParamChangeOption[],
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {

            const txRaw =
                await this.getSignedTxSubmitParameterChangeProposal(wallet,
                    title,
                    description,
                    initialDeposit,
                    paramList,
                    txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        amount: number,
        recipient: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {

            const txRaw = await this.getSignedTxSubmitCommunityPoolSpendProposal(wallet,
                title,
                description,
                initialDeposit,
                amount,
                recipient,
                txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    async submitTextProposal(wallet: FirmaWalletService,
        title: string,
        description: string,
        initialDeposit: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
        try {

            const txRaw = await this.getSignedTxSubmitTextProposal(wallet, title, description, initialDeposit, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxVote(wallet: FirmaWalletService,
        proposalId: Long,
        option: VotingOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const voter = await wallet.getAddress();
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const message = txClient.msgVote({ proposalId: proposalId, voter: voter, option: option as number });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async vote(wallet: FirmaWalletService, proposalId: number, option: VotingOption, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {

            const longId = Long.fromInt(proposalId);
            const txRaw = await this.getSignedTxVote(wallet, longId, option, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }


    private async getSignedTxDeposit(wallet: FirmaWalletService,
        proposalId: Long,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);

            const depositor = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };
            const message = txClient.msgDeposit({ proposalId: proposalId, depositor: depositor, amount: [sendAmount] });

            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async deposit(wallet: FirmaWalletService, proposalId: number, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<BroadcastTxResponse> {
        try {

            const longId = Long.fromInt(proposalId);
            const txRaw = await this.getSignedTxDeposit(wallet, longId, amount, txMisc);

            const txClient = new GovTxClient(wallet.getRawWallet(), this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    //query

    async getCurrentVoteInfo(id: string): Promise<CurrentVoteInfo> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetCurrentVoteInfo(id);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getParam(): Promise<ProposalParam> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetParam();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposal(id: string): Promise<ProposalInfo> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetProposal(id);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposalListByStatus(status: ProposalStatus): Promise<ProposalInfo[]> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetProposalListByStatus(status);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposalList(): Promise<ProposalInfo[]> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetProposalList();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}