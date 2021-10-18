import { GovTxClient, GovQueryClient, TxMisc, DefaultTxMisc, getSignAndBroadcastOption, ParamChangeOption, SoftwareUpgradePlan, VotingOption, ProposalInfo, ProposalStatus, ProposalParam } from './firmachain/gov';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
import { BroadcastTxResponse } from './firmachain/common/stargateclient';
import { Any } from './firmachain/google/protobuf/any';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { CommunityPoolSpendProposal } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution';
import { ParameterChangeProposal } from 'cosmjs-types/cosmos/params/v1beta1/params';
import { CancelSoftwareUpgradeProposal, SoftwareUpgradeProposal } from 'cosmjs-types/cosmos/upgrade/v1beta1/upgrade';
import Long from 'long';

export class FirmaGovService {

	constructor(private _config: FirmaConfig) { }

	public async getGasEstimationDeposit(wallet: FirmaWalletService, proposalId: Long, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<number> {

		try {
			let txRaw = await this.getSignedTxDeposit(wallet, proposalId, amount, txMisc);
			return await FirmaUtil.estimateGas(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxSubmitTextProposal(wallet: FirmaWalletService, title: string, description: string, initialDepositFCT: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };

			const proposal = TextProposal.fromPartial({
				title: title,
				description: description,
			});

			let content = Any.fromPartial({
				typeUrl: "/cosmos.gov.v1beta1.TextProposal",
				value: Uint8Array.from(TextProposal.encode(proposal).finish()),
			});

			let proposer = await wallet.getAddress();
			let message = txClient.msgSubmitProposal({ content: content, initialDeposit: [sendAmount], proposer: proposer });
			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxCancelSoftwareUpgradeProposal(wallet: FirmaWalletService, title: string, description: string, initialDepositFCT: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const initialDepositAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };

			const proposal = CancelSoftwareUpgradeProposal.fromPartial({
				title: title,
				description: description,
			});

			let content = Any.fromPartial({
				typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
				value: Uint8Array.from(SoftwareUpgradeProposal.encode(proposal).finish()),
			});

			let proposer = await wallet.getAddress();
			let message = txClient.msgSubmitProposal({ content: content, initialDeposit: [initialDepositAmount], proposer: proposer });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxSoftwareUpgradeProposal(wallet: FirmaWalletService, title: string, description: string, initialDepositFCT: number, plan: SoftwareUpgradePlan, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const initialDepositAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };

			const proposal = SoftwareUpgradeProposal.fromPartial({
				title: title,
				description: description,
				plan: plan,
			});

			let content = Any.fromPartial({
				typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
				value: Uint8Array.from(SoftwareUpgradeProposal.encode(proposal).finish()),
			});

			let proposer = await wallet.getAddress();
			let message = txClient.msgSubmitProposal({ content: content, initialDeposit: [initialDepositAmount], proposer: proposer });
			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxParameterChangeProposal(wallet: FirmaWalletService, title: string, description: string, initialDepositFCT: number, paramList: ParamChangeOption[], txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const initialDepositAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };

			const proposal = ParameterChangeProposal.fromPartial({
				title: title,
				description: description,
				changes: paramList,
			});

			let content = Any.fromPartial({
				typeUrl: "/cosmos.params.v1beta1.ParameterChangeProposal",
				value: Uint8Array.from(ParameterChangeProposal.encode(proposal).finish()),
			});

			let proposer = await wallet.getAddress();
			let message = txClient.msgSubmitProposal({ content: content, initialDeposit: [initialDepositAmount], proposer: proposer });
			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxCommunityPoolSpendProposal(wallet: FirmaWalletService, title: string, description: string, initialDepositFCT: number, amount: number, recipient: string, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const initialDepositAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(initialDepositFCT) };
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };

			const proposal = CommunityPoolSpendProposal.fromPartial({
				title: title,
				description: description,
				recipient: recipient,
				amount: [sendAmount]
			});

			let content = Any.fromPartial({
				typeUrl: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
				value: Uint8Array.from(CommunityPoolSpendProposal.encode(proposal).finish()),
			});

			let proposer = await wallet.getAddress();
			let message = txClient.msgSubmitProposal({ content: content, initialDeposit: [initialDepositAmount], proposer: proposer });
			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async submitCancelSoftwareUpgradeProposal(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			let txRaw = await this.getSignedTxCancelSoftwareUpgradeProposal(wallet, title, description, initialDeposit, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async submitSoftwareUpgradeProposalByHeight(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, upgradeName: string, height: Long, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let plan = {
				name: upgradeName,
				time: undefined,
				height: height,
				info: undefined,
				upgradedClientState: undefined
			};

			let txRaw = await this.getSignedTxSoftwareUpgradeProposal(wallet, title, description, initialDeposit, plan, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async submitSoftwareUpgradeProposalByTime(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, upgradeName: string, upgradeTime: Date, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {
			let plan = {
				name: upgradeName,
				time: upgradeTime,
				height: undefined,
				info: undefined,
				upgradedClientState: undefined
			};

			let txRaw = await this.getSignedTxSoftwareUpgradeProposal(wallet, title, description, initialDeposit, plan, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	public async submitParameterChangeProposal(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, paramList: ParamChangeOption[], txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			let txRaw = await this.getSignedTxParameterChangeProposal(wallet, title, description, initialDeposit, paramList, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async submitCommunityPoolSpendProposal(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, amount: number, recipient: string, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			let txRaw = await this.getSignedTxCommunityPoolSpendProposal(wallet, title, description, initialDeposit, amount, recipient, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	public async submitTextProposal(wallet: FirmaWalletService, title: string, description: string, initialDeposit: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			let txRaw = await this.getSignedTxSubmitTextProposal(wallet, title, description, initialDeposit, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getSignedTxVote(wallet: FirmaWalletService, proposalId: Long, option: VotingOption, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let voter = await wallet.getAddress();
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			let message = txClient.msgVote({ proposalId: proposalId, voter: voter, option: option as number });
			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async vote(wallet: FirmaWalletService, proposalId: number, option: VotingOption, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			const longId = Long.fromInt(proposalId);
			let txRaw = await this.getSignedTxVote(wallet, longId, option, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}


	private async getSignedTxDeposit(wallet: FirmaWalletService, proposalId: Long, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<TxRaw> {

		try {
			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);

			const depositor = await wallet.getAddress();
			const sendAmount = { denom: this._config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amount) };
			let message = txClient.msgDeposit({ proposalId: proposalId, depositor: depositor, amount: [sendAmount] });

			return await txClient.sign([message], getSignAndBroadcastOption(this._config.denom, txMisc));

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async deposit(wallet: FirmaWalletService, proposalId: number, amount: number, txMisc: TxMisc = DefaultTxMisc): Promise<BroadcastTxResponse> {
		try {

			const longId = Long.fromInt(proposalId);
			let txRaw = await this.getSignedTxDeposit(wallet, longId, amount, txMisc);

			let txClient = new GovTxClient(wallet.getRawWallet(), this._config.rpcAddress);
			return await txClient.broadcast(txRaw);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	//query


	public async getParam(): Promise<ProposalParam> {
		try {
			let queryClient = new GovQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetParam();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getProposal(id: string): Promise<ProposalInfo> {
		try {
			let queryClient = new GovQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetProposal(id);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getProposalListByStatus(status: ProposalStatus): Promise<ProposalInfo[]> {
		try {
			let queryClient = new GovQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetProposalListByStatus(status);

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async getProposalList(): Promise<ProposalInfo[]> {
		try {
			let queryClient = new GovQueryClient(this._config.restApiAddress);
			let result = await queryClient.queryGetProposalList();

			return result;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}

