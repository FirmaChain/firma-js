import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[05. Bank test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
	})

	it('Bank getBalance() of a user who has never been created.', async () => {

		const newWallet = await firma.Wallet.newWallet();

		const result = await firma.Bank.getBalance(await newWallet.getAddress());
		expect(result).to.be.equal("0");

		const result2 = await firma.Bank.getBalance(await newWallet.getAddress());
		expect(result2).to.be.equal("0");
	});

	it('Bank getBalance()', async () => {

		const result = await firma.Bank.getBalance(aliceAddress);
		expect(result).to.not.equal("");
	});

	it('Bank getTokenBalance()', async () => {

		// for single usage
		const tokenID = "ukomx6";
		const result = await firma.Bank.getTokenBalance(aliceAddress, tokenID);

		expect(result).to.not.equal("");
	});

	it('Bank getTokenBalance() - not exist tokenID', async () => {

		// for single usage
		const tokenID = "ukomx6sdfakljfd";
		const result = await firma.Bank.getTokenBalance(aliceAddress, tokenID);
		expect(result).to.not.equal("");
	});


	it('Bank getTokenBalanceList()', async () => {

		// for wallet application
		const result = await firma.Bank.getTokenBalanceList(aliceAddress);
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