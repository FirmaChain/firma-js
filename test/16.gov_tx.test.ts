import { expect } from 'chai';
import { VotingOption } from '../sdk/firmachain/common';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { Plan } from '@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade';
import { Params as StakingParams } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { Params as GovParams } from "cosmjs-types/cosmos/gov/v1/gov";

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

// If test it, the properties of the chain change, so skip it.

describe('[16. Gov Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

	const extractValue = (events: readonly any[], eventType: string, attrKey: string) => {
		for (const event of events) {
			if (event.type === eventType) {
				for (const attr of event.attributes) {
					if (attr.key === attrKey) {
						return attr.value;
					}
				}
			}
		}
		return "";
	};

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
	});

	// Test order
	// 1. submitProposal
	// 2. deposit(for pass minium deposit value)
	// 3. vote

	it('SubmitTextProposal Test', async () => {

		const initialDepositFCT = 2500;
		const title = "test submit proposal";
		const description = "test description";

		const result = await firma.Gov.submitTextProposal(aliceWallet, title, description, initialDepositFCT);

		expect(result.code).to.equal(0);
	});

	it('SubmitCommunityPoolSpendProposal Test', async () => {

		const initialDepositFCT = 2500;
		const title = "Community spend proposal1";
		const summary = "This is a community spend proposal";
		const amountFCT = 1000;
		const recipient = aliceAddress;

		const result = await firma.Gov.submitCommunityPoolSpendProposal(aliceWallet, title, summary, initialDepositFCT, amountFCT, recipient);
		expect(result.code).to.equal(0);
	});

	it('SubmitStakingParamsUpdateProposal Test', async () => {

		const title = "Staking Parameter Change proposal";
		const summary = "This is a Staking Parameter change proposal";
		const initialDepositFCT = 2500;
		
		const stakingParmas = await firma.Staking.getParams();
		const changeValue = 100;
		const unbondingData = parseDuration(stakingParmas.unbonding_time);

		const changeStakingParams: StakingParams = {
			unbondingTime: { seconds: BigInt(unbondingData.seconds), nanos: unbondingData.nanos },
			maxValidators: changeValue,
			maxEntries: stakingParmas.max_entries,
			historicalEntries: stakingParmas.historical_entries,
			bondDenom: stakingParmas.bond_denom,
			minCommissionRate: toDec18String(stakingParmas.min_commission_rate)
		};
		const metadata = "";

		const result = await firma.Gov.submitStakingParamsUpdateProposal(aliceWallet, title, summary, initialDepositFCT, changeStakingParams, metadata);
		expect(result.code).to.equal(0);

		function toDec18String(decimal: string): string {
			return BigInt(parseFloat(decimal) * 1e18).toString();
		}

		function parseDuration(durationStr: string): { seconds: bigint; nanos: number } {
			const match = /^(\d+)(\.(\d+))?s$/.exec(durationStr);
			if (!match) throw new Error(`Invalid duration string: ${durationStr}`);
		
			const seconds = BigInt(match[1]);
			const fractionalPart = match[3] || "";
			const padded = (fractionalPart + "000000000").slice(0, 9);
			const nanos = Number(padded);
		
			return { seconds, nanos };
		}
	});

	it('SubmitGovParamsUpdateProposal Test', async () => {
		
		const title = "Staking Parameter Change proposal";
		const summary = "This is a Staking Parameter change proposal";
		const initialDepositFCT = 2500;

		const govParams = await firma.Gov.getParam();
		const convertMaxDepositPeriod = parseDuration(govParams.deposit_params.max_deposit_period);
		const convertVotingPeriod = parseDuration(govParams.voting_params.voting_period);

		const changeGovParams: GovParams = {
			minDeposit: govParams.deposit_params.min_deposit,
			maxDepositPeriod: convertMaxDepositPeriod,
			votingPeriod: convertVotingPeriod,
			quorum: govParams.tally_params.quorum,
			threshold: govParams.tally_params.threshold,
			vetoThreshold: govParams.tally_params.veto_threshold,
			minInitialDepositRatio: govParams.min_initial_deposit_ratio,
			burnVoteQuorum: govParams.burn_vote_quorum,
			burnProposalDepositPrevote: govParams.burn_proposal_deposit_prevote,
			burnVoteVeto: govParams.burn_vote_veto
		};
		const metadata = "";

		const result = await firma.Gov.submitGovParamsUpdateProposal(aliceWallet, title, summary, initialDepositFCT, changeGovParams, metadata);
		expect(result.code).to.equal(0);

		function parseDuration(durationStr: string): { seconds: bigint; nanos: number } {
			const match = /^(\d+)(\.(\d+))?s$/.exec(durationStr);
			if (!match) throw new Error(`Invalid duration string: ${durationStr}`);
		
			const seconds = BigInt(match[1]);
			const fractionalPart = match[3] || "";
			const padded = (fractionalPart + "000000000").slice(0, 9);
			const nanos = Number(padded);
		
			return { seconds, nanos };
		}
	});

	it('SubmitSoftwareUpgradeProposal Test', async () => {

		const initialDeposit = 5000;
		const title = "CancelProposal test proposal";
		const summary = "This is a Text & CancelProposal";
		// deprecated plan time option
		const plan: Plan = {
			name: 'v0.5.1',
			time: {
				seconds: BigInt(0),
				nanos: 0
			},
			height: BigInt(1050000),
			info: ''
		};
		const metadata = "";

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposal(aliceWallet, title, summary, initialDeposit, plan, metadata);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Gov.submitSoftwareUpgradeProposal(aliceWallet, title, summary, initialDeposit, plan, metadata, { gas, fee });
		expect(result.code).to.be.equal(0);
	});

	it('SubmitTextProposal & CancelProposal Test', async () => {

		const initialDeposit = 5000;
		const title = "CancelProposal test proposal";
		const description = "This is a Text & CancelProposal";

		// Submit TextProposal
		let gas = await firma.Gov.getGasEstimationSubmitTextProposal(aliceWallet, title, description, initialDeposit);
		let fee = Math.ceil(gas * 0.1);

		let result = await firma.Gov.submitTextProposal(aliceWallet, title, description, initialDeposit, { gas, fee});
		const proposal_id = extractValue(result.events, "submit_proposal", "proposal_id");
		expect(result.code).to.be.equal(0);

		// CancelProposal
		gas = await firma.Gov.getGasEstimationCancelProposal(aliceWallet, proposal_id);
		fee = Math.ceil(gas * 0.1);

		result = await firma.Gov.cancelProposal(aliceWallet, proposal_id, { gas, fee });

		expect(result.code).to.be.equal(0);
	});

	// TODO: get recent gov proposal list and then set proposalId for below case
	const tempProposalId = 1;

	// more deposit after initial deposit case
	it.skip('Deposit OK', async () => {

		const proposalId = tempProposalId;
		const amount = 2500;

		const result = await firma.Gov.deposit(aliceWallet, proposalId, amount);
		expect(result.code).to.equal(0);
	});

	it.skip('Vote - alice YES', async () => {

		const proposalId = tempProposalId;
		const result = await firma.Gov.vote(aliceWallet, proposalId, VotingOption.VOTE_OPTION_YES);
		expect(result.code).to.equal(0);
	});

	it.skip('Vote - bob NO', async () => {

		const proposalId = tempProposalId;
		const result = await firma.Gov.vote(bobWallet, proposalId, VotingOption.VOTE_OPTION_NO);
		expect(result.code).to.equal(0);
	});

	it('SubmitCommunityPoolSpendProposal & Deposit & Vote scenario test', async () => {

		const initialDepositFCT = 2500;
		const title = "Community spend proposal1";
		const summary = "This is a community spend proposal";
		const amountFCT = 1000;
		const recipient = aliceAddress;

		let result = await firma.Gov.submitCommunityPoolSpendProposal(aliceWallet, title, summary, initialDepositFCT, amountFCT, recipient);
		expect(result.code).to.equal(0);

		const proposalId = extractValue(result.events, "submit_proposal", "proposal_id");
		const addDepositAmount = 2500;
		result = await firma.Gov.deposit(aliceWallet, proposalId, addDepositAmount);
		expect(result.code).to.equal(0);

		result = await firma.Gov.vote(aliceWallet, proposalId, VotingOption.VOTE_OPTION_YES);
		expect(result.code).to.equal(0);

		result = await firma.Gov.vote(aliceWallet, proposalId, VotingOption.VOTE_OPTION_NO);
		expect(result.code).to.equal(0);
	});
});