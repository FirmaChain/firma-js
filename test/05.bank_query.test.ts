import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, firmaFeeMnemonic, TestChainConfig } from './config_test';

describe('[05. Bank test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Bank getBalance() of a user who has never been created.', async () => {

		const newWallet = await firma.Wallet.newWallet();

		const result = await firma.Bank.getBalance(await newWallet.getAddress());
		expect(result).to.be.equal("0");

		const result2 = await firma.Bank.getBalance(await newWallet.getAddress());
		expect(result2).to.be.equal("0");
	});

	it('Bank getBalance()', async () => {

		const wallet = await firma.Wallet.fromMnemonic(firmaFeeMnemonic);
		const result = await firma.Bank.getBalance(await wallet.getAddress());

		expect(result).to.not.equal("");
	});

	it('Bank getTokenBalance()', async () => {

		// for single usage
		const tokenID = "ukomx6"
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Bank.getTokenBalance(await aliceWallet.getAddress(), tokenID);

		expect(result).to.not.equal("");
	});

	it('Bank getTokenBalance() - not exist tokenID', async () => {

		// for single usage
		const tokenID = "ukomx6sdfakljfd"
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		
		const result = await firma.Bank.getTokenBalance(await aliceWallet.getAddress(), tokenID);
		expect(result).to.not.equal("");
	});


	it('Bank getTokenBalanceList()', async () => {

		// for wallet application
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Bank.getTokenBalanceList(await aliceWallet.getAddress());

		expect(result).to.not.equal(null);
	});

	it('Bank getSupply()', async () => {

		const result = await firma.Bank.getSupply();
		expect(result).to.not.equal("0");
	});

	it('Bank getTokenSupply()', async () => {

		const result = await firma.Bank.getTokenSupply("ukomx1670550348");
		expect(result).to.not.equal("");
	});
});