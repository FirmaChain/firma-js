/**
 * Ledger Gov Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/06.gov.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';
import { Plan } from '@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade';

import { VotingOption } from '../../sdk/firmachain/common';
import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { TestChainConfig } from '../config_test';

describe('[06. Ledger Gov Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;

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
		return '';
	};

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('SubmitTextProposal via Ledger', async function() {
		this.timeout(120000);

		const title = 'Ledger TextProposal Test';
		const description = 'Submitted via Ledger hardware wallet';
		const initialDepositFCT = 2500;

		const gas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, title, description, initialDepositFCT);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Gov.submitTextProposal(ledgerWallet, title, description, initialDepositFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SubmitCommunityPoolSpendProposal via Ledger', async function() {
		this.timeout(120000);

		const initialDepositFCT = 2500;
		const title = 'Ledger CommunityPoolSpend Proposal';
		const summary = 'Submitted via Ledger hardware wallet';
		const amountFCT = 1000;
		const recipient = ledgerAddress;

		const gas = await firma.Gov.getGasEstimationSubmitCommunityPoolSpendProposal(ledgerWallet, title, summary, initialDepositFCT, amountFCT, recipient);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitCommunityPoolSpendProposal(ledgerWallet, title, summary, initialDepositFCT, amountFCT, recipient, '', { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SubmitStakingParamsUpdateProposal via Ledger', async function() {
		this.timeout(120000);

		const title = 'Ledger Staking Param Update Proposal';
		const summary = 'Submitted via Ledger hardware wallet';
		const initialDepositFCT = 2500;

		const params = await firma.Staking.getParamsAsStakingParams();
		params.maxValidators = 100;
		params.historicalEntries = 10000;
		params.minCommissionRate = FirmaUtil.processCommissionRateAsDecimal(params.minCommissionRate);

		const metadata = '';

		const gas = await firma.Gov.getGasEstimationSubmitStakingParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitStakingParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SubmitGovParamsUpdateProposal via Ledger', async function() {
		this.timeout(120000);

		const title = 'Ledger Gov Param Update Proposal';
		const summary = 'Submitted via Ledger hardware wallet';
		const initialDepositFCT = 2500;

		const params = await firma.Gov.getParamAsGovParams();
		params.burnProposalDepositPrevote = true;
		const metadata = '';

		const gas = await firma.Gov.getGasEstimationSubmitGovParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitGovParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SubmitSoftwareUpgradeProposal via Ledger', async function() {
		this.timeout(120000);

		const initialDeposit = 5000;
		const title = 'Ledger SoftwareUpgrade Proposal';
		const summary = 'Submitted via Ledger hardware wallet';
		const plan: Plan = {
			name: 'v0.5.1',
			time: { seconds: BigInt(0), nanos: 0 },
			height: BigInt(1050000),
			info: ''
		};
		const metadata = '';

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposal(ledgerWallet, title, summary, initialDeposit, plan, metadata);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Gov.submitSoftwareUpgradeProposal(ledgerWallet, title, summary, initialDeposit, plan, metadata, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SubmitTextProposal & CancelProposal via Ledger', async function() {
		this.timeout(240000);

		const initialDeposit = 5000;
		const title = 'Ledger CancelProposal Test';
		const description = 'Submitted then cancelled via Ledger';

		let gas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, title, description, initialDeposit);
		let fee = Math.ceil(gas * 0.1);

		let result = await firma.Gov.submitTextProposal(ledgerWallet, title, description, initialDeposit, { gas, fee });
		const proposalId = extractValue(result.events, 'submit_proposal', 'proposal_id');
		expect(result.code).to.equal(0);

		gas = await firma.Gov.getGasEstimationCancelProposal(ledgerWallet, proposalId);
		fee = Math.ceil(gas * 0.1);

		result = await firma.Gov.cancelProposal(ledgerWallet, proposalId, { gas, fee });

		console.log('[Ledger] cancel result code:', result.code);
		expect(result.code).to.equal(0);
	});

	// Scenario: submit a TextProposal that immediately enters the voting period
	// (initial deposit ≥ min_deposit), then vote YES → NO → ABSTAIN → NO_WITH_VETO
	// on the same proposal. Each later vote overrides the previous one per
	// Cosmos SDK gov semantics, so all four submissions should return code 0.
	it('SubmitTextProposal → Vote all options scenario via Ledger', async function() {
		this.timeout(600000);

		// 1. Compute an initial deposit that clears the chain's min_deposit.
		const govParams = await firma.Gov.getParamAsGovParams();
		const minDepositCoin = govParams.minDeposit[0];
		const minDepositFct = Math.ceil(Number(minDepositCoin.amount) / 1_000_000);
		const initialDepositFCT = minDepositFct + 10;
		console.log('[Ledger] min_deposit:', minDepositCoin.amount, minDepositCoin.denom,
			'→ using', initialDepositFCT, 'FCT');

		// 2. Submit TextProposal.
		const submitTitle = 'Ledger Voting Scenario Test';
		const submitDescription = 'Submitted to exercise all four vote options via Ledger';

		const submitGas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, submitTitle, submitDescription, initialDepositFCT);
		const submitFee = Math.ceil(submitGas * 0.1);
		console.log('[Ledger] submit gas:', submitGas, 'fee:', submitFee);

		const submitResult = await firma.Gov.submitTextProposal(
			ledgerWallet,
			submitTitle,
			submitDescription,
			initialDepositFCT,
			{ gas: submitGas, fee: submitFee }
		);
		expect(submitResult.code).to.equal(0);

		const proposalIdStr = extractValue(submitResult.events, 'submit_proposal', 'proposal_id');
		expect(proposalIdStr).to.not.equal('');
		const proposalId = Number(proposalIdStr);
		console.log('[Ledger] proposalId:', proposalId);

		// 3. Vote all four options on the same proposal; later votes override earlier ones.
		const voteYesGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_YES);
		const voteYesFee = Math.ceil(voteYesGas * 0.1);
		console.log('[Ledger] vote YES gas:', voteYesGas, 'fee:', voteYesFee);
		const voteYes = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_YES, { gas: voteYesGas, fee: voteYesFee });
		console.log('[Ledger] vote YES code:', voteYes.code);
		expect(voteYes.code).to.equal(0);

		const voteNoGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO);
		const voteNoFee = Math.ceil(voteNoGas * 0.1);
		console.log('[Ledger] vote NO gas:', voteNoGas, 'fee:', voteNoFee);
		const voteNo = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO, { gas: voteNoGas, fee: voteNoFee });
		console.log('[Ledger] vote NO code:', voteNo.code);
		expect(voteNo.code).to.equal(0);

		const voteAbstainGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_ABSTAIN);
		const voteAbstainFee = Math.ceil(voteAbstainGas * 0.1);
		console.log('[Ledger] vote ABSTAIN gas:', voteAbstainGas, 'fee:', voteAbstainFee);
		const voteAbstain = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_ABSTAIN, { gas: voteAbstainGas, fee: voteAbstainFee });
		console.log('[Ledger] vote ABSTAIN code:', voteAbstain.code);
		expect(voteAbstain.code).to.equal(0);

		const voteVetoGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO);
		const voteVetoFee = Math.ceil(voteVetoGas * 0.1);
		console.log('[Ledger] vote NO_WITH_VETO gas:', voteVetoGas, 'fee:', voteVetoFee);
		const voteVeto = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO, { gas: voteVetoGas, fee: voteVetoFee });
		console.log('[Ledger] vote NO_WITH_VETO code:', voteVeto.code);
		expect(voteVeto.code).to.equal(0);
	});
});
