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

		const memo = 'dapp-station bank send';
		const gas = await firma.Bank.getGasEstimationSend(ledgerWallet, bobAddress, 1, { memo });
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Bank.send(ledgerWallet, bobAddress, 1, { memo, gas, fee });

		console.log('[Ledger] bank.send code:', result.code);
		expect(result.code).to.equal(0);
	});

	// ---------- authz ----------
	it('authz grant delegate via Ledger', async function() {
		this.timeout(120000);

		const maxFCT = 100;
		const memo = 'dapp-station authz grant delegate';
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantStakeAuthorization(
			ledgerWallet, bobAddress, [valOperAddress],
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expiration, maxFCT,
			{ memo }
		);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantStakeAuthorization(
			ledgerWallet, bobAddress, [valOperAddress],
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expiration, maxFCT,
			{ memo, gas, fee }
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
		const memo = 'dapp-station distribution withdraw';

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewards(ledgerWallet, validatorAddress, { memo });
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Distribution.withdrawAllRewards(ledgerWallet, validatorAddress, { memo, gas, fee });

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

		const title = 'Dapp Station Text Proposal';
		const description = 'Submitted via Ledger from Station test';
		const memo = 'dapp-station gov submitTextProposal';

		const gas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, title, description, 2500, { memo });
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitTextProposal(ledgerWallet, title, description, 2500, { memo, gas, fee });

		console.log('[Ledger] gov.text code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitCommunityPoolSpendProposal via Ledger', async function() {
		this.timeout(120000);

		const title = 'Dapp Station Community Pool Spend';
		const summary = 'Submitted via Ledger from Station test';
		const memo = 'dapp-station gov submitCommunityPoolSpendProposal';

		const gas = await firma.Gov.getGasEstimationSubmitCommunityPoolSpendProposal(
			ledgerWallet, title, summary, 2500, 1000, ledgerAddress, { memo }
		);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitCommunityPoolSpendProposal(
			ledgerWallet, title, summary, 2500, 1000, ledgerAddress, '',
			{ memo, gas, fee }
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

		const title = 'Dapp Station Staking Params Update';
		const summary = 'Submitted via Ledger from Station test';
		const memo = 'dapp-station gov submitStakingParamsUpdateProposal';

		const gas = await firma.Gov.getGasEstimationSubmitStakingParamsUpdateProposal(
			ledgerWallet, title, summary, 2500, params, '', { memo }
		);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitStakingParamsUpdateProposal(
			ledgerWallet, title, summary, 2500, params, '',
			{ memo, gas, fee }
		);

		console.log('[Ledger] gov.stakingParams code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('gov submitGovParamsUpdateProposal via Ledger', async function() {
		this.timeout(120000);

		const params = await firma.Gov.getParamAsGovParams();
		params.burnProposalDepositPrevote = true;

		const title = 'Dapp Station Gov Params Update';
		const summary = 'Submitted via Ledger from Station test';
		const memo = 'dapp-station gov submitGovParamsUpdateProposal';

		const gas = await firma.Gov.getGasEstimationSubmitGovParamsUpdateProposal(
			ledgerWallet, title, summary, 2500, params, '', { memo }
		);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Gov.submitGovParamsUpdateProposal(
			ledgerWallet, title, summary, 2500, params, '',
			{ memo, gas, fee }
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

		const submitTitle = 'Dapp Station Cancel Target';
		const submitDescription = 'Submitted then cancelled via Ledger';
		const submitMemo = 'dapp-station gov submitTextProposal (cancel target)';

		const submitGas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, submitTitle, submitDescription, 5000, { memo: submitMemo });
		const submitFee = Math.ceil(submitGas * 0.1);
		console.log('[Ledger] submit gas:', submitGas, 'fee:', submitFee);

		const submitResult = await firma.Gov.submitTextProposal(
			ledgerWallet, submitTitle, submitDescription, 5000,
			{ memo: submitMemo, gas: submitGas, fee: submitFee }
		);
		const proposalId = extractValue(submitResult.events, 'submit_proposal', 'proposal_id');
		expect(submitResult.code).to.equal(0);

		const cancelMemo = 'dapp-station gov cancelProposal';
		const cancelGas = await firma.Gov.getGasEstimationCancelProposal(ledgerWallet, proposalId, { memo: cancelMemo });
		const cancelFee = Math.ceil(cancelGas * 0.1);
		console.log('[Ledger] cancel gas:', cancelGas, 'fee:', cancelFee);

		const cancelResult = await firma.Gov.cancelProposal(ledgerWallet, proposalId, { memo: cancelMemo, gas: cancelGas, fee: cancelFee });

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

		const submitTitle = 'Dapp Station Vote Scenario';
		const submitDescription = 'Submitted to exercise all four vote options via Ledger';
		const submitMemo = 'dapp-station gov submitTextProposal (vote scenario)';

		const submitGas = await firma.Gov.getGasEstimationSubmitTextProposal(ledgerWallet, submitTitle, submitDescription, initialDepositFCT, { memo: submitMemo });
		const submitFee = Math.ceil(submitGas * 0.1);
		console.log('[Ledger] submit gas:', submitGas, 'fee:', submitFee);

		const submitResult = await firma.Gov.submitTextProposal(
			ledgerWallet, submitTitle, submitDescription, initialDepositFCT,
			{ memo: submitMemo, gas: submitGas, fee: submitFee }
		);
		expect(submitResult.code).to.equal(0);

		const proposalIdStr = extractValue(submitResult.events, 'submit_proposal', 'proposal_id');
		expect(proposalIdStr).to.not.equal('');
		const proposalId = Number(proposalIdStr);
		console.log('[Ledger] proposalId:', proposalId);

		const voteYesMemo = 'dapp-station gov vote YES';
		const voteYesGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_YES, { memo: voteYesMemo });
		const voteYesFee = Math.ceil(voteYesGas * 0.1);
		console.log('[Ledger] vote YES gas:', voteYesGas, 'fee:', voteYesFee);
		const voteYes = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_YES,
			{ memo: voteYesMemo, gas: voteYesGas, fee: voteYesFee });
		console.log('[Ledger] vote YES code:', voteYes.code);
		expect(voteYes.code).to.equal(0);

		const voteNoMemo = 'dapp-station gov vote NO';
		const voteNoGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO, { memo: voteNoMemo });
		const voteNoFee = Math.ceil(voteNoGas * 0.1);
		console.log('[Ledger] vote NO gas:', voteNoGas, 'fee:', voteNoFee);
		const voteNo = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO,
			{ memo: voteNoMemo, gas: voteNoGas, fee: voteNoFee });
		console.log('[Ledger] vote NO code:', voteNo.code);
		expect(voteNo.code).to.equal(0);

		const voteAbstainMemo = 'dapp-station gov vote ABSTAIN';
		const voteAbstainGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_ABSTAIN, { memo: voteAbstainMemo });
		const voteAbstainFee = Math.ceil(voteAbstainGas * 0.1);
		console.log('[Ledger] vote ABSTAIN gas:', voteAbstainGas, 'fee:', voteAbstainFee);
		const voteAbstain = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_ABSTAIN,
			{ memo: voteAbstainMemo, gas: voteAbstainGas, fee: voteAbstainFee });
		console.log('[Ledger] vote ABSTAIN code:', voteAbstain.code);
		expect(voteAbstain.code).to.equal(0);

		const voteVetoMemo = 'dapp-station gov vote NO_WITH_VETO';
		const voteVetoGas = await firma.Gov.getGasEstimationVote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO, { memo: voteVetoMemo });
		const voteVetoFee = Math.ceil(voteVetoGas * 0.1);
		console.log('[Ledger] vote NO_WITH_VETO gas:', voteVetoGas, 'fee:', voteVetoFee);
		const voteVeto = await firma.Gov.vote(ledgerWallet, proposalId, VotingOption.VOTE_OPTION_NO_WITH_VETO,
			{ memo: voteVetoMemo, gas: voteVetoGas, fee: voteVetoFee });
		console.log('[Ledger] vote NO_WITH_VETO code:', voteVeto.code);
		expect(voteVeto.code).to.equal(0);
	});

	// ---------- staking ----------
	it('staking delegate via Ledger', async function() {
		this.timeout(120000);

		const memo = 'dapp-station staking delegate';
		const gas = await firma.Staking.getGasEstimationDelegate(ledgerWallet, valOperAddress, 60, { memo });
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Staking.delegate(ledgerWallet, valOperAddress, 60, { memo, gas, fee });

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

		const delegateMemo = 'dapp-station staking delegate (redelegate source)';
		const delegateGas = await firma.Staking.getGasEstimationDelegate(ledgerWallet, src, amount, { memo: delegateMemo });
		const delegateFee = Math.ceil(delegateGas * 0.1);
		console.log('[Ledger] delegate gas:', delegateGas, 'fee:', delegateFee);

		const delegateResult = await firma.Staking.delegate(ledgerWallet, src, amount, { memo: delegateMemo, gas: delegateGas, fee: delegateFee });
		expect(delegateResult.code).to.equal(0);

		const redelegateMemo = 'dapp-station staking redelegate';
		const gas = await firma.Staking.getGasEstimationRedelegate(ledgerWallet, src, dst, amount, { memo: redelegateMemo });
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] redelegate gas:', gas, 'fee:', fee);

		const result = await firma.Staking.redelegate(ledgerWallet, src, dst, amount, { memo: redelegateMemo, gas, fee });

		console.log('[Ledger] staking.redelegate code:', result.code);
		expect(result.code).to.equal(0);
	});
});
