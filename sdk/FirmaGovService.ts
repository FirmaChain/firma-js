import {
    GovTxClient,
    GovQueryClient,
    TxMisc,
    ParamChangeOption,
    VotingOption,
    ProposalInfo,
    ProposalStatus,
    ProposalParam,
    CurrentVoteInfo
} from "./firmachain/gov";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";
import { Any } from "./firmachain/google/protobuf/any";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { SoftwareUpgradeProposal } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";

import { DeliverTxResponse } from "@cosmjs/stargate";
import { Plan } from "@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade";

export class FirmaGovService {

    constructor(private readonly config: FirmaConfig) { }

    async getGasEstimationVote(wallet: FirmaWalletService,
        proposalId: number,
        option: VotingOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const bigIntId = BigInt(proposalId);

            const txRaw = await this.getSignedTxVote(wallet, bigIntId, option, txMisc);
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
            const bigIntId = BigInt(proposalId);

            const txRaw = await this.getSignedTxDeposit(wallet, bigIntId, amount, txMisc);
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
        height: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {

            const upgradeHeight = BigInt(height);

            const plan = {
                name: upgradeName,
                time: undefined as any,
                height: upgradeHeight,
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
            const message = GovTxClient.msgSubmitProposal({ content: content, initialDeposit: [sendAmount], proposer: proposer });

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
        plan: Plan,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
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
            const message = GovTxClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
            const message = GovTxClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
            const message = GovTxClient.msgSubmitProposal({
                content: content,
                initialDeposit: [initialDepositAmount],
                proposer: proposer
            });

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

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
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {

            const upgradeHeight = BigInt(height);

            const plan = {
                name: upgradeName,
                time: undefined as any,
                height: upgradeHeight,
                info: undefined as any,
                upgradedClientState: undefined as any
            };

            const txRaw = await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, description, initialDeposit, plan, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {

            const txRaw = await this.getSignedTxSubmitParameterChangeProposal(wallet, title, description, initialDeposit, paramList, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {

            const txRaw = await this.getSignedTxSubmitCommunityPoolSpendProposal(wallet,
                title,
                description,
                initialDeposit,
                amount,
                recipient,
                txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxSubmitTextProposal(wallet, title, description, initialDeposit, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxVote(wallet: FirmaWalletService,
        proposalId: bigint,
        option: VotingOption,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const voter = await wallet.getAddress();
            const txClient = new GovTxClient(wallet, this.config.rpcAddress);

            const message = GovTxClient.msgVote({ proposalId: proposalId, voter: voter, option: option as number });
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async vote(wallet: FirmaWalletService, proposalId: number, option: VotingOption, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {

            const bigIntId = BigInt(proposalId);
            const txRaw = await this.getSignedTxVote(wallet, bigIntId, option, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxDeposit(wallet: FirmaWalletService,
        proposalId: bigint,
        amount: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const depositor = await wallet.getAddress();
            const sendAmount = { denom: this.config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };
            const message = GovTxClient.msgDeposit({ proposalId: proposalId, depositor: depositor, amount: [sendAmount] });

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async deposit(wallet: FirmaWalletService, proposalId: number, amount: number, txMisc: TxMisc = DefaultTxMisc):
        Promise<DeliverTxResponse> {
        try {
            const bigIntId = BigInt(proposalId);
            const txRaw = await this.getSignedTxDeposit(wallet, bigIntId, amount, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
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