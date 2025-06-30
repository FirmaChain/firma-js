import { expect } from 'chai';
import { VotingOption } from '../sdk/firmachain/common';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { MsgCommunityPoolSpend } from '@kintsugi-tech/cosmjs-types/cosmos/distribution/v1beta1/tx';

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

	it.skip('SubmitCommunityPoolSpendProposal Test', async () => {
		
		const initialDepositFCT = 10;
		const title = "Community spend proposal1";
		const description = "This is a community spend proposal";
		const amount = 1000;
		const recipient = bobAddress;
		
		const communityPoolSpendMsg = {
			typeUrl: "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
			value: Uint8Array.from(MsgCommunityPoolSpend.encode(MsgCommunityPoolSpend.fromPartial({
				authority: GOV_AUTHORITY, // gov module address
				recipient: recipient,
				amount: [{
					denom: "ufct",
					amount: amount.toString()
				}]
			})).finish())
		};

		const result = await firma.Gov.submitGenericProposal(aliceWallet, title, description, [{ amount: initialDepositFCT.toString(), denom: "ufct" }], "metadata", [communityPoolSpendMsg]);

		expect(result.code).to.equal(0);
	});

	it.skip('SubmitParameterChangeProposal Test', async () => {

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

	// This unit test needs specific option setup, so it’s skipped by default.
	it.skip('SubmitSoftwareUpgradeProposalByHeight Test', async () => {

		const initialDepositFCT = 5000;
		const title = "FIRMACHAIN v0.5.0 Upgrade";
		const description = `## OVERVIEW
This is a proposal on FIRMACHAIN Software Upgrade(v0.5.0-alpha1).

need form (comment)

Once this proposal passes, the FIRMACHAIN network will be upgraded at block height [xxx,xxx].

## Upgrade features
Following are the details of this upgrade. 
  - Cosmos SDK : v0.45.9 -> v0.50.12
  - CometBFT : v0.34.21 -> v0.38.17
  - Chain Binary : v0.4.0 -> v0.5.0
  - IBC-go(IBC) : v4.4.0 -> v8.6.1
  - Wasmd : v0.29.2 -> v0.54.0
  - New Governance parameters
	  - MinInitialDepositRatio : 0.5
	  - ProposalCancelRatio : 0.5

## Timeline
need form (comment)

If we are faced with any problems during the upgrade, a hasty and swift communication via Discord is necessary to solve the issue.
Any FIRMACHAIN Validator who hasn't joined our Discord channel must contact us at contact@firmachain.org before this Software Upgrade.

## Actions required by node operators
Once this proposal passes and when the block height reaches xxxxx, any block creation activity on the FIRMACHAIN (Colosseum-1) network will be halted. 
All Validators must upgrade using the manual binary switch or the Cosmovisor in order to conduct the FIRMACHAIN Software Upgrade.

For a more detailed upgrade guide, please visit https://github.com/FirmaChain/mainnet/blob/main/docs/upgrade-notes-v0.5.0.md`;

		const upgradeName = "v0.5.0";
		const upgradeHeight = 558800;

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Gov.submitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight, { gas, fee });

		expect(result.code).to.equal(0);
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

	// NOTICE: time-based upgrades have been deprecated in the SDK: invalid request
	/*it.skip('SubmitSoftwareUpgradeProposalByTime Test', async () => {

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