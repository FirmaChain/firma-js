import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[05. Bank test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('Get Balance() of a user who has never been created.', async () => {

		const wallet = await firma.Wallet.newWallet();

		var result = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result).to.be.equal("0");

		var result2 = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result2).to.be.equal("0");
	});

});