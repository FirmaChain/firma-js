import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[04. Bank Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
	});

	it('bank send OK', async () => {

		const amount = 1;
		const memo = "TEST";
		const result = await firma.Bank.send(aliceWallet, bobAddress, amount, { memo: memo });
		expect(result.code).to.equal(0);
	});

	it('bank send Fail - send lots of money', async () => {

		const amount = 20000000000000;
		// result.code = 5 : Test failure when trying to send more than the available balance
		const result = await firma.Bank.send(aliceWallet, bobAddress, amount);
		expect(result.code).to.equal(5);
	});

	it('bank send Fail - Big fee remittance', async function () {

		const amount = 2;
		const gas = 9990000000000;
		const fee = 90000000000;

		// NOTICE: As a result of the test, in the case of a large fee input
		// it is not recorded as tx, but an extension is given at the code space level.
		try {
			await firma.Bank.send(aliceWallet, bobAddress, amount, { gas, fee });
			expect.fail('Transaction should have failed due to excessive fee');
		} catch (error) {
			expect(error).to.exist;
		}
	});
});