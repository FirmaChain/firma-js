/**
 * Ledger Staking Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/09.staking.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { TestChainConfig, validatorMnemonic } from '../config_test';

describe('[09. Ledger Staking Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let valOperAddress: string;

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = await validatorWallet.getAddress();
		valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('delegate via Ledger', async function() {
		this.timeout(120000);

		const amountFCT = 60;

		const gas = await firma.Staking.getGasEstimationDelegate(ledgerWallet, valOperAddress, amountFCT);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Staking.delegate(ledgerWallet, valOperAddress, amountFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('undelegate via Ledger', async function() {
		this.timeout(120000);

		const amountFCT = 5;
		const gas = await firma.Staking.getGasEstimationUndelegate(ledgerWallet, valOperAddress, amountFCT);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		const result = await firma.Staking.undelegate(ledgerWallet, valOperAddress, amountFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('redelegate via Ledger', async function() {
		this.timeout(180000);

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		if (validatorList.length < 2) {
			console.log('[Ledger] skip redelegate: need at least two validators');
			this.skip();
		}

		const srcValoperAddress = validatorList[0].operator_address;
		const dstValoperAddress = validatorList[1].operator_address;
		const amount = 10;

		const delegateGas = await firma.Staking.getGasEstimationDelegate(ledgerWallet, srcValoperAddress, amount);
		const delegateFee = Math.ceil(delegateGas * 0.1);
		console.log('[Ledger] delegate gas:', delegateGas, 'fee:', delegateFee);

		const delegateResult = await firma.Staking.delegate(ledgerWallet, srcValoperAddress, amount, { gas: delegateGas, fee: delegateFee });
		expect(delegateResult.code).to.equal(0);

		const gas = await firma.Staking.getGasEstimationRedelegate(ledgerWallet, srcValoperAddress, dstValoperAddress, amount);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] redelegate gas:', gas, 'fee:', fee);

		const result = await firma.Staking.redelegate(ledgerWallet, srcValoperAddress, dstValoperAddress, amount, { gas, fee });

		console.log('[Ledger] redelegate code:', result.code);
		expect(result.code).to.equal(0);
	});
});
