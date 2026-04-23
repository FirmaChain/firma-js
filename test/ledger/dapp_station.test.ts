/**
 * Ledger Dapp Station Tx Test
 *
 * Covers the transactions a Station-style dapp signs via Ledger:
 *   - bank.send
 *   - authz grant delegate
 *   - distribution: withdraw (single validator), withdraw all
 *   - gov: text / communityPoolSpend / stakingParamsUpdate / govParamsUpdate / softwareUpgrade proposals
 *   - gov: vote (YES, NO, ABSTAIN, NO_WITH_VETO)
 *   - gov: cancelProposal
 *   - staking: delegate, undelegate, redelegate
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/11.dapp_station.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';
import { Plan } from '@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade';

import { AuthorizationType } from '../../sdk/firmachain/authz';
import { VotingOption } from '../../sdk/firmachain/common';
import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig, validatorMnemonic } from '../config_test';

describe('[dapp_station. Ledger Dapp Station Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;
	let valOperAddress: string;

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

	const oneDayExpiration = () => {
		const date = new Date();
		date.setDate(date.getDate() + 1);
		return {
			seconds: BigInt(Math.floor(date.getTime() / 1000)),
			nanos: (date.getTime() % 1000) * 1000000
		};
	};

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = await validatorWallet.getAddress();
		valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);

		console.log('[Ledger] address:', ledgerAddress);
	});

	// ---------- bank ----------
	it('bank send via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Bank.send(ledgerWallet, bobAddress, 1, { memo: 'dapp-station bank send' });

		console.log('[Ledger] bank.send code:', result.code);
		expect(result.code).to.equal(0);
	});

	// ---------- authz ----------
	it('authz grant delegate via Ledger', async function() {
		this.timeout(120000);

		const maxFCT = 100;
		const result = await firma.Authz.grantStakeAuthorization(
			ledgerWallet, bobAddress, [valOperAddress],
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, oneDayExpiration(), maxFCT,
			{ memo: 'dapp-station authz grant delegate' }
		);

		console.log('[Ledger] authz.grantDelegate code:', result.code);
		expect(result.code).to.equal(0);
	});

	// ---------- distribution ----------
	it('distribution withdraw (single validator) via Ledger', async function() {
		this.timeout(120000);

		const delegationList = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		if (delegationList.length === 0) {
			console.log('[Ledger] skip withdraw: no delegation');
			this.skip();
		}
		const validatorAddress = delegationList[0].delegation.validator_address;

		const result = await firma.Distribution.withdrawAllRewards(ledgerWallet, validatorAddress, { memo: 'dapp-station distribution withdraw' });

		console.log('[Ledger] distribution.withdraw code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('distribution withdraw all via Ledger', async function() {
		this.timeout(180000);

		const delegationList = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		if (delegationList.length === 0) {
			console.log('[Ledger] skip withdraw all: no delegation');
			this.skip();
		}

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewardsFromAllValidator(ledgerWallet, delegationList);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Distribution.withdrawAllRewardsFromAllValidator(ledgerWallet, delegationList, { memo: 'dapp-station distribution withdraw all', gas, fee });

		console.log('[Ledger] distribution.withdrawAll code:', result.code);
		expect(result.code).to.equal(0);
	});

	// ---------- gov proposals ----------
	it('gov submitTextProposal via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Gov.submitTextProposal(
			ledgerWallet,
			'Dapp Station Text Proposal',
			'Submitted via Ledger from Station test',
			2500,
			{ memo: 'dapp-station gov submitTextProposal' }
		);

		console.log('[Ledger] gov.text code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitCommunityPoolSpendProposal via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Gov.submitCommunityPoolSpendProposal(
			ledgerWallet,
			'Dapp Station Community Pool Spend',
			'Submitted via Ledger from Station test',
			2500,
			1000,
			ledgerAddress,
			'',
			{ memo: 'dapp-station gov submitCommunityPoolSpendProposal' }
		);

		console.log('[Ledger] gov.communityPoolSpend code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitStakingParamsUpdateProposal via Ledger', async function() {
		this.timeout(120000);

		const params = await firma.Staking.getParamsAsStakingParams();
		params.maxValidators = 100;
		params.historicalEntries = 10000;
		params.minCommissionRate = FirmaUtil.processCommissionRateAsDecimal(params.minCommissionRate);

		const result = await firma.Gov.submitStakingParamsUpdateProposal(
			ledgerWallet,
			'Dapp Station Staking Params Update',
			'Submitted via Ledger from Station test',
			2500,
			params,
			'',
			{ memo: 'dapp-station gov submitStakingParamsUpdateProposal' }
		);

		console.log('[Ledger] gov.stakingParams code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitGovParamsUpdateProposal via Ledger', async function() {
		this.timeout(120000);

		const params = await firma.Gov.getParamAsGovParams();
		params.burnProposalDepositPrevote = true;

		const result = await firma.Gov.submitGovParamsUpdateProposal(
			ledgerWallet,
			'Dapp Station Gov Params Update',
			'Submitted via Ledger from Station test',
			2500,
			params,
			'',
			{ memo: 'dapp-station gov submitGovParamsUpdateProposal' }
		);

		console.log('[Ledger] gov.govParams code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitSoftwareUpgradeProposal via Ledger', async function() {
		this.timeout(120000);

		const plan: Plan = {
			name: 'v0.5.1',
			time: { seconds: BigInt(0), nanos: 0 },
			height: BigInt(1050000),
			info: ''
		};

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposal(
			ledgerWallet, 'Dapp Station Software Upgrade', 'Submitted via Ledger from Station test', 5000, plan, ''
		);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Gov.submitSoftwareUpgradeProposal(
			ledgerWallet,
			'Dapp Station Software Upgrade',
			'Submitted via Ledger from Station test',
			5000,
			plan,
			'',
			{ memo: 'dapp-station gov submitSoftwareUpgradeProposal', gas, fee }
		);

		console.log('[Ledger] gov.softwareUpgrade code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitTextProposal & cancelProposal via Ledger', async function() {
		this.timeout(240000);

		const submitResult = await firma.Gov.submitTextProposal(
			ledgerWallet,
			'Dapp Station Cancel Target',
			'Submitted then cancelled via Ledger',
			5000,
			{ memo: 'dapp-station gov submitTextProposal (cancel target)' }
		);
		const proposalId = extractValue(submitResult.events, 'submit_proposal', 'proposal_id');
		expect(submitResult.code).to.equal(0);

		const cancelResult = await firma.Gov.cancelProposal(ledgerWallet, proposalId, { memo: 'dapp-station gov cancelProposal' });

		console.log('[Ledger] gov.cancel code:', cancelResult.code);
		expect(cancelResult.code).to.equal(0);
	});

	// ---------- gov vote (all options) ----------
	// Scenario: submit a TextProposal that immediately enters the voting period
	// (initial deposit ≥ min_deposit), then vote YES → NO → ABSTAIN → NO_WITH_VETO
	// on the same proposal. Later votes override earlier ones per Cosmos SDK gov
	// semantics, so all four submissions should return code 0.
	it('gov submitTextProposal → vote all options scenario via Ledger', async function() {
		this.timeout(600000);

		const govParams = await firma.Gov.getParamAsGovParams();
		const minDepositCoin = govParams.minDeposit[0];
		const minDepositFct = Math.ceil(Number(minDepositCoin.amount) / 1_000_000);
		const initialDepositFCT = minDepositFct + 10;
		console.log('[Ledger] min_deposit:', minDepositCoin.amount, minDepositCoin.denom,
			'→ using', initialDepositFCT, 'FCT');

		const submitResult = await firma.Gov.submitTextProposal(
			ledgerWallet,
			'Dapp Station Vote Scenario',
			'Submitted to exercise all four vote options via Ledger',
			initialDepositFCT,
			{ memo: 'dapp-station gov submitTextProposal (vote scenario)' }
		);
		expect(submitResult.code).to.equal(0);

		const proposalIdStr = extractValue(submitResult.events, 'submit_proposal', 'proposal_id');
		expect(proposalIdStr).to.not.equal('');
		const proposalId = Number(proposalIdStr);
		console.log('[Ledger] proposalId:', proposalId);

		const voteYes = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_YES,
			{ memo: 'dapp-station gov vote YES' });
		console.log('[Ledger] vote YES code:', voteYes.code);
		expect(voteYes.code).to.equal(0);

		const voteNo = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO,
			{ memo: 'dapp-station gov vote NO' });
		console.log('[Ledger] vote NO code:', voteNo.code);
		expect(voteNo.code).to.equal(0);

		const voteAbstain = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_ABSTAIN,
			{ memo: 'dapp-station gov vote ABSTAIN' });
		console.log('[Ledger] vote ABSTAIN code:', voteAbstain.code);
		expect(voteAbstain.code).to.equal(0);

		const voteVeto = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO,
			{ memo: 'dapp-station gov vote NO_WITH_VETO' });
		console.log('[Ledger] vote NO_WITH_VETO code:', voteVeto.code);
		expect(voteVeto.code).to.equal(0);
	});

	// ---------- staking ----------
	it('staking delegate via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Staking.delegate(ledgerWallet, valOperAddress, 60, { memo: 'dapp-station staking delegate' });

		console.log('[Ledger] staking.delegate code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('staking undelegate via Ledger', async function() {
		this.timeout(120000);

		const amountFCT = 5;
		const gas = await firma.Staking.getGasEstimationUndelegate(ledgerWallet, valOperAddress, amountFCT);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Staking.undelegate(ledgerWallet, valOperAddress, amountFCT, { memo: 'dapp-station staking undelegate', gas, fee });

		console.log('[Ledger] staking.undelegate code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('staking redelegate via Ledger', async function() {
		this.timeout(180000);

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		if (validatorList.length < 2) {
			console.log('[Ledger] skip redelegate: need at least two validators');
			this.skip();
		}

		const src = validatorList[0].operator_address;
		const dst = validatorList[1].operator_address;
		const amount = 10;

		const delegateResult = await firma.Staking.delegate(ledgerWallet, src, amount, { memo: 'dapp-station staking delegate (redelegate source)' });
		expect(delegateResult.code).to.equal(0);

		const gas = await firma.Staking.getGasEstimationRedelegate(ledgerWallet, src, dst, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Staking.redelegate(ledgerWallet, src, dst, amount, { memo: 'dapp-station staking redelegate', gas, fee });

		console.log('[Ledger] staking.redelegate code:', result.code);
		expect(result.code).to.equal(0);
	});
});
