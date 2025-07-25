import {
    GovTxClient,
    GovQueryClient,
    TxMisc,
    VotingOption,
    ProposalStatus,
    CurrentVoteInfo,
    GovParamType,
} from "./firmachain/gov";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Any } from "./firmachain/google/protobuf/any";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { DefaultTxMisc, FirmaUtil, getSignAndBroadcastOption } from "./FirmaUtil";

import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Plan } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { MsgUpdateParams as StakingMsgUpdateParams } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import equal from 'fast-deep-equal';

// temporarly using kintsugi-tech/cosmjs-types - this will be returned to original cosmjs-types after the PR is merged
import {
    MsgCancelProposal,
    MsgSubmitProposal,
    MsgUpdateParams as GovMsgUpdateParmas
} from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/tx";
import { MsgSoftwareUpgrade } from "@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/tx";
import { MsgCommunityPoolSpend } from "@kintsugi-tech/cosmjs-types/cosmos/distribution/v1beta1/tx";
import { Proposal, Params as GovParams } from "@kintsugi-tech/cosmjs-types/cosmos/gov/v1/gov";
import { Params as StakingParams } from "@kintsugi-tech/cosmjs-types/cosmos/staking/v1beta1/staking";

export class FirmaGovService {

    static readonly GOV_AUTHORITY = "firma10d07y265gmmuvt4z0w9aw880jnsr700j53mj8f";

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

    async getGasEstimationSubmitSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        plan: Plan,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const message = {
                typeUrl: "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade",
                value: MsgSoftwareUpgrade.encode(MsgSoftwareUpgrade.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    plan: plan
                })).finish()
            };
            const txRaw = await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);
            return await FirmaUtil.estimateGas(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitStakingParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        params: StakingParams,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        
        try {
            const requestedParams = {
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            }
            const fromPartialParams = StakingMsgUpdateParams.fromPartial({
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            });

            if (!equal(requestedParams.params, fromPartialParams.params)) {
                throw new Error("All staking parameters must be provided. Use Staking.getParamsAsStakingParams() to get current values and override only the parameters you want to change.");
            }

            const message = {
                typeUrl: "/cosmos.staking.v1beta1.MsgUpdateParams",
                value: StakingMsgUpdateParams.encode(StakingMsgUpdateParams.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    params: params
                })).finish()
            };

            const txRaw = await this.getSignedTxSubmitStakingParamsUpdateProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);
            return await FirmaUtil.estimateGas(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitGovParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        params: GovParams,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const requestedParams = {
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            }
            const fromPartialParams = GovMsgUpdateParmas.fromPartial({
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            });

            if (!equal(requestedParams.params, fromPartialParams.params)) {
                throw new Error("All governance parameters must be provided. Use getParamAsGovParams() to get current values and override only the parameters you want to change.");
            }
            
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgUpdateParams",
                value: GovMsgUpdateParmas.encode(GovMsgUpdateParmas.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    params: params
                })).finish()
            }

            const txRaw = await this.getSignedTxSubmitGovParamsUpdateProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);
            return await FirmaUtil.estimateGas(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getGasEstimationSubmitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        amountFCT: number,
        recipient: string,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {

        try {
            const amount = FirmaUtil.getUFCTStringFromFCT(amountFCT);
            const message = {
                typeUrl: "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
                value: Uint8Array.from(MsgCommunityPoolSpend.encode(MsgCommunityPoolSpend.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY, // gov module address
                    recipient: recipient,
                    amount: [{
                        denom: this.config.denom,
                        amount: amount.toString()
                    }]
                })).finish())
            }

            const txRaw = await this.getSignedTxSubmitCommunityPoolSpendProposal(wallet, title, summary, initialDepositFCT, [message], recipient, txMisc);
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

    async getGasEstimationCancelProposal(wallet: FirmaWalletService,
        proposalId: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<number> {
        
        try {
            const txRaw = await this.getSignedTxCancelProposal(wallet, proposalId, txMisc);
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
        summary: string,
        initialDepositFCT: number,
        messages: {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const proposer = await wallet.getAddress();
            const initialDeposit = [{ amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT), denom: this.config.denom }];
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
                value: MsgSubmitProposal.fromPartial({
                    title: title,
                    summary: summary,
                    metadata: metadata,
                    messages: messages,
                    proposer: proposer,
                    initialDeposit: initialDeposit
                })
            };

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitStakingParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        messages: {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const proposer = await wallet.getAddress();
            const initialDeposit = [{ amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT), denom: this.config.denom }];
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
                value: MsgSubmitProposal.fromPartial({
                    title: title,
                    summary: summary,
                    metadata: metadata,
                    messages: messages,
                    proposer: proposer,
                    initialDeposit: initialDeposit
                })
            };

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitGovParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        messages: {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const proposer = await wallet.getAddress();
            const initialDeposit = [{ amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT), denom: this.config.denom }];
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
                value: MsgSubmitProposal.fromPartial({
                    title: title,
                    summary: summary,
                    metadata: metadata,
                    messages: messages,
                    proposer: proposer,
                    initialDeposit: initialDeposit
                })
            };

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxSubmitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        messages: {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        try {
            const proposer = await wallet.getAddress();
            const initialDeposit = [{ amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT), denom: this.config.denom }];
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
                value: MsgSubmitProposal.fromPartial({
                    title: title,
                    summary: summary,
                    metadata: metadata,
                    messages: messages,
                    proposer: proposer,
                    initialDeposit: initialDeposit,
                })
            };

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    private async getSignedTxCancelProposal(wallet: FirmaWalletService,
        proposalId: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

        const proposer = await wallet.getAddress();
        const message = {
            typeUrl: "/cosmos.gov.v1.MsgCancelProposal",
            value: MsgCancelProposal.fromPartial({
              proposalId: BigInt(proposalId),
              proposer: proposer
            })
        };

        const txClient = new GovTxClient(wallet, this.config.rpcAddress);
        return await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
    }
   
    async submitSoftwareUpgradeProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        plan: Plan,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {

        try {
            const message = {
                typeUrl: "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade",
                value: MsgSoftwareUpgrade.encode(MsgSoftwareUpgrade.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    plan: plan
                })).finish()
            };

            const txRaw = await this.getSignedTxSubmitSoftwareUpgradeProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitStakingParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        params: StakingParams,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {

        try {
            const requestedParams = {
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            }
            const fromPartialParams = StakingMsgUpdateParams.fromPartial({
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            });
    
            if (!equal(requestedParams.params, fromPartialParams.params)) {
                throw new Error("All staking parameters must be provided. Use Staking.getParamsAsStakingParams() to get current values and override only the parameters you want to change.");
            }

            const message = {
                typeUrl: "/cosmos.staking.v1beta1.MsgUpdateParams",
                value: StakingMsgUpdateParams.encode(StakingMsgUpdateParams.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    params: params
                })).finish()
            };

            const txRaw = await this.getSignedTxSubmitStakingParamsUpdateProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitGovParamsUpdateProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        params: GovParams,
        metadata: string = "",
        txmisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        
        try {
            const requestedParams = {
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            }
            const fromPartialParams = GovMsgUpdateParmas.fromPartial({
                authority: FirmaGovService.GOV_AUTHORITY,
                params: params
            });

            if (!equal(requestedParams.params, fromPartialParams.params)) {
                throw new Error("All governance parameters must be provided. Use getParamAsGovParams() to get current values and override only the parameters you want to change.");
            }

            const message = {
                typeUrl: "/cosmos.gov.v1.MsgUpdateParams",
                value: GovMsgUpdateParmas.encode(GovMsgUpdateParmas.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY,
                    params: params
                })).finish()
            };

            const txRaw = await this.getSignedTxSubmitGovParamsUpdateProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txmisc);

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            return await txClient.broadcast(txRaw);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async submitCommunityPoolSpendProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDepositFCT: number,
        amountFCT: number,
        recipient: string,
        metadata: string = "",
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {

        try {
            const amount = FirmaUtil.getUFCTStringFromFCT(amountFCT);
            const message = {
                typeUrl: "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
                value: Uint8Array.from(MsgCommunityPoolSpend.encode(MsgCommunityPoolSpend.fromPartial({
                    authority: FirmaGovService.GOV_AUTHORITY, // gov module address
                    recipient: recipient,
                    amount: [{
                        denom: this.config.denom,
                        amount: amount.toString()
                    }]
                })).finish())
            }

            const txRaw = await this.getSignedTxSubmitCommunityPoolSpendProposal(wallet, title, summary, initialDepositFCT, [message], metadata, txMisc);

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

    async submitGenericProposal(wallet: FirmaWalletService,
        title: string,
        summary: string,
        initialDeposit: Coin[],
        metadata: string,
        msgs: {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
            
        try {
            const proposer = await wallet.getAddress();
            const message = {
                typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
                value: MsgSubmitProposal.fromPartial({
                    title: title,
                    summary: summary,
                    metadata: metadata,
                    messages: msgs,
                    proposer: proposer,
                    initialDeposit: initialDeposit,
                })
            };

            const txClient = new GovTxClient(wallet, this.config.rpcAddress);
            const signed = await txClient.sign([message], getSignAndBroadcastOption(this.config.denom, txMisc));
            return await txClient.broadcast(signed);
            
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async cancelProposal(wallet: FirmaWalletService,
        proposalId: number,
        txMisc: TxMisc = DefaultTxMisc): Promise<DeliverTxResponse> {
        try {
            const txRaw = await this.getSignedTxCancelProposal(wallet, proposalId, txMisc);

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

    async getParam(): Promise<GovParamType> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetParam();

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getParamAsGovParams(): Promise<GovParams> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetParam(); // get result as GovParamType

            // return as GovParams type
            return {
                minDeposit: result.min_deposit,
                maxDepositPeriod: FirmaUtil.createDurationFromString(result.max_deposit_period),
                votingPeriod: FirmaUtil.createDurationFromString(result.voting_period),
                quorum: result.quorum,
                threshold: result.threshold,
                vetoThreshold: result.veto_threshold,
                minInitialDepositRatio: result.min_initial_deposit_ratio,
                proposalCancelRatio: result.proposal_cancel_ratio,
                proposalCancelDest: result.proposal_cancel_dest,
                expeditedVotingPeriod: FirmaUtil.createDurationFromString(result.expedited_voting_period),
                expeditedThreshold: result.expedited_threshold,
                expeditedMinDeposit: result.expedited_min_deposit,
                burnVoteQuorum: result.burn_vote_quorum,
                burnProposalDepositPrevote: result.burn_proposal_deposit_prevote,
                burnVoteVeto: result.burn_vote_veto,
                minDepositRatio: result.min_deposit_ratio
            };

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposal(id: string): Promise<Proposal> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetProposal(id);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposalListByStatus(status: ProposalStatus): Promise<Proposal[]> {
        try {
            const queryClient = new GovQueryClient(this.config.restApiAddress);
            const result = await queryClient.queryGetProposalListByStatus(status);

            return result;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getProposalList(): Promise<Proposal[]> {
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