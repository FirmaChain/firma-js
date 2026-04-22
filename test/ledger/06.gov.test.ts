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

		const result = await firma.Gov.submitCommunityPoolSpendProposal(ledgerWallet, title, summary, initialDepositFCT, amountFCT, recipient);

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

		const result = await firma.Gov.submitStakingParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata);

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

		const result = await firma.Gov.submitGovParamsUpdateProposal(ledgerWallet, title, summary, initialDepositFCT, params, metadata);

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

	// NOTE: vote tests require an active proposal in the voting period.
	// Set `activeProposalId` to a valid id before enabling.
	const activeProposalId = 1;

	it.skip('Vote YES via Ledger', async function() {
		this.timeout(120000);
		const result = await firma.Gov.vote(ledgerWallet, activeProposalId, VotingOption.VOTE_OPTION_YES);
		expect(result.code).to.equal(0);
	});

	it.skip('Vote NO via Ledger', async function() {
		this.timeout(120000);
		const result = await firma.Gov.vote(ledgerWallet, activeProposalId, VotingOption.VOTE_OPTION_NO);
		expect(result.code).to.equal(0);
	});

	it.skip('Vote ABSTAIN via Ledger', async function() {
		this.timeout(120000);
		const result = await firma.Gov.vote(ledgerWallet, activeProposalId, VotingOption.VOTE_OPTION_ABSTAIN);
		expect(result.code).to.equal(0);
	});

	it.skip('Vote NO_WITH_VETO via Ledger', async function() {
		this.timeout(120000);
		const result = await firma.Gov.vote(ledgerWallet, activeProposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO);
		expect(result.code).to.equal(0);
	});
});
