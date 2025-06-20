import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[04. Bank Tx Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('bank send OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const amount = 1;
		const memo = "TEST";

		var result = await firma.Bank.send(wallet, "firma1nw9x2t53c37krjfsmsuj3ty6czkctdjq924rpn", amount, { memo: memo });
		expect(result.code).to.equal(0);
	});

	it('bank send Fail - send lots of money', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 20000000000000;

		var result = await firma.Bank.send(wallet, await targetWallet.getAddress(), amount);
		expect(result.code).to.equal(5);
	});

	it('bank send Fail - Big fee remittance', async function () {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 2;

		const gas = 9990000000000;
		const fee = 90000000000;

		// NOTICE: As a result of the test, in the case of a large fee input
		// it is not recorded as tx, but an extension is given at the code space level.
		try {
			await firma.Bank.send(wallet, await targetWallet.getAddress(), amount, { gas, fee });
			expect(true).to.not.equal(true);
		} catch (error) {
			expect(true).to.not.equal(false);
			return;
		}
	});
});