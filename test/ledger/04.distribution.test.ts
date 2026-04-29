/**
 * Ledger Distribution Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/04.distribution.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { TestChainConfig } from '../config_test';

describe('[04. Ledger Distribution Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('withdrawAllRewards for a single validator via Ledger', async function() {
		this.timeout(120000);

		const delegationList = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		if (delegationList.length === 0) {
			console.log('[Ledger] skip: no delegation found');
			this.skip();
		}
		const validatorAddress = delegationList[0].delegation.validator_address;

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewards(ledgerWallet, validatorAddress);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Distribution.withdrawAllRewards(ledgerWallet, validatorAddress, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for all delegated validators via Ledger', async function() {
		this.timeout(180000);

		const delegationList = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		if (delegationList.length === 0) {
			console.log('[Ledger] skip: no delegation found');
			this.skip();
		}

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewardsFromAllValidator(ledgerWallet, delegationList);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Distribution.withdrawAllRewardsFromAllValidator(ledgerWallet, delegationList, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('FundCommunityPool via Ledger', async function() {
		this.timeout(120000);

		const amount = 1;

		const gas = await firma.Distribution.getGasEstimationFundCommunityPool(ledgerWallet, amount);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Distribution.fundCommunityPool(ledgerWallet, amount, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('SetWithdrawAddress via Ledger', async function() {
		this.timeout(120000);

		const gas = await firma.Distribution.getGasEstimationSetWithdrawAddress(ledgerWallet, ledgerAddress);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Distribution.setWithdrawAddress(ledgerWallet, ledgerAddress, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	// NOTE: only valid when the Ledger address is a validator operator.
	it.skip('withdrawValidatorCommission via Ledger', async function() {
		this.timeout(120000);

		const valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(ledgerAddress);

		const gas = await firma.Distribution.getGasEstimationWithdrawValidatorCommission(ledgerWallet, valOperAddress);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Distribution.withdrawValidatorCommission(ledgerWallet, valOperAddress, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
