import { expect } from 'chai';
import Long from 'long';
import { VotingOption } from '../sdk/firmachain/common';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

// If test it, the properties of the chain change, so skip it.

describe.skip('[16. Gov Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	// Test order
	// 1. submitProposal
	// 2. deposit(for pass minium deposit value)
	// 3. vote

	it('SubmitTextProposal Test', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10;
		const title = "test submit proposal";
		const description = "test description";

		var result = await firma.Gov.submitTextProposal(wallet, title, description, initialDepositFCT);

		console.log(result);
		expect(result.code).to.equal(0);
	});

	it('SubmitCommunityPoolSpendProposal Test', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const initialDepositFCT = 10;
		const title = "Community spend proposal1";
		const description = "This is a community spend proposal";
		const amount = 1000;
		const recipient = await bobWallet.getAddress();

		var result = await firma.Gov.submitCommunityPoolSpendProposal(aliceWallet, title, description, initialDepositFCT, amount, recipient);

		console.log(result);
		expect(result.code).to.equal(0);
	});

	it('SubmitParameterChangeProposal Test', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10;
		const title = "Parameter Change proposal1";
		const description = "This is a Parameter change proposal";

		const changeParamList = [{
			subspace: "staking",
			key: "MaxValidators",
			value: "100",
		}];

		var result = await firma.Gov.submitParameterChangeProposal(aliceWallet, title, description, initialDepositFCT, changeParamList);

		console.log(result);
		expect(result.code).to.equal(0);
	});

	it('SubmitSoftwareUpgradeProposalByHeight Test', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const upgradeName = "v0.2.7";
		const upgradeHeight = 20000000;

		var result = await firma.Gov.submitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight);

		console.log(result);
		expect(result.code).to.equal(0);
	});

	it('SubmitCancelSoftwareUpgradeProposal Test', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 1000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		var result = await firma.Gov.submitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);

		console.log(result);
		expect(result.code).to.equal(0);
	});

	// NOTICE: time-based upgrades have been deprecated in the SDK: invalid request
	/*it.skip('SubmitSoftwareUpgradeProposalByTime Test', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const initialDepositFCT = 8;
		const title = "Software Upgrade proposal2";
		const description = "This is a software upgrade proposal";

		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 3);

		const upgradeName = "v0.2.4";
		const upgradeTime = expirationDate;
		const upgradeInfo = "info?";

		var result = await firma.Gov.SubmitSoftwareUpgradeProposalByTime(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeTime);

		console.log(result);
		expect(result.code).to.equal(0);
	});*/

	// TODO: get recent gov proposal list and then set proposalId for below case
	const tempProposalId = 1;

	// more deposit after initial deposit case
	it('Deposit OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const proposalId = tempProposalId;
		const amount = 1000;
		var result = await firma.Gov.deposit(wallet, proposalId, amount);
		//console.log(result);
		expect(result.code).to.equal(0);
	});

	it('Vote - alice YES', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const proposalId = tempProposalId;

		var result = await firma.Gov.vote(wallet, proposalId, VotingOption.VOTE_OPTION_YES);
		//console.log(result);
		expect(result.code).to.equal(0);
	});

	it('Vote - bob NO', async () => {

		const wallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const proposalId = tempProposalId;

		var result = await firma.Gov.vote(wallet, proposalId, VotingOption.VOTE_OPTION_NO);
		//console.log(result);
		expect(result.code).to.equal(0);
	});

	// TODO: more voting case need it!
});