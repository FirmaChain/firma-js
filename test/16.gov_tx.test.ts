import { expect } from 'chai';
import { VotingOption } from '../sdk/firmachain/common';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { MsgCommunityPoolSpend } from '@kintsugi-tech/cosmjs-types/cosmos/distribution/v1beta1/tx';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { Plan } from '@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade';

// If test it, the properties of the chain change, so skip it.
const GOV_AUTHORITY = "firma10d07y265gmmuvt4z0w9aw880jnsr700j53mj8f";

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

	it('SubmitParameterChangeProposal Test', async () => {

		const initialDepositFCT = 10;
		const title = "Parameter Change proposal1";
		const description = "This is a Parameter change proposal";

		const changeParamList = [{
			subspace: "staking",
			key: "MaxValidators",
			value: "100",
		}];

		const result = await firma.Gov.submitParameterChangeProposal(aliceWallet, title, description, initialDepositFCT, changeParamList);

		expect(result.code).to.equal(0);
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

	// This unit test needs specific option setup, so it’s skipped by default.
	it.skip('SubmitCancelSoftwareUpgradeProposal Test', async () => {

		const initialDepositFCT = 1000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const result = await firma.Gov.submitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);

		expect(result.code).to.equal(0);
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
	const tempProposalId = 15;

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
});