/**
 * Ledger Bank Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/00.bank.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[00. Ledger Bank Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('bank send via Ledger', async function() {
		this.timeout(120000);

		const amount = 1;
		const memo = 'Ledger bank send test';

		const gas = await firma.Bank.getGasEstimationSend(ledgerWallet, bobAddress, amount, { memo });
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Bank.send(ledgerWallet, bobAddress, amount, { memo, gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	// NOTE: requires an existing tokenID owned by the Ledger address.
	it.skip('bank sendToken via Ledger', async function() {
		this.timeout(120000);

		const tokenID = 'ukomx';
		const amount = 1;
		const decimal = 6;

		const result = await firma.Bank.sendToken(ledgerWallet, bobAddress, tokenID, amount, decimal);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
