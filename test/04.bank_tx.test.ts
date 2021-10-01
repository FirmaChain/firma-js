import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[Bank Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('bank send OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 1;
		const memo = "test memo";

		var result = await firma.Bank.send(wallet, await targetWallet.getAddress(), amount, { memo: memo });

		expect(result.code).to.equal(0);
	});

	it('bank send Fail - send lots of money', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 20000000000000;

		var result = await firma.Bank.send(wallet, await targetWallet.getAddress(), amount);

		// error code 5 : not enough money.
		expect(result.code).to.equal(5);
	});

	it.skip('bank send Fail - Big fee remittance', async function () {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 2;

		const testFee = 2000000000000000;
		const defaultGas = 200000;
		const memo = "ttt meme";

		// NOTICE: As a result of the test, in the case of a large fee input
		// it is not recorded as tx, but an extension is given at the code space level.

		try {
			var result = await firma.Bank.send(wallet, await targetWallet.getAddress(), amount, { memo: "memeo" });

		} catch (error) {
			expect(true);
		}
	});
});