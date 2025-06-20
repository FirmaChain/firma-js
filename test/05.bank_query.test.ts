import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[05. Bank test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Bank getBalance() of a user who has never been created.', async () => {

		const wallet = await firma.Wallet.newWallet();

		var result = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result).to.be.equal("0");

		var result2 = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result2).to.be.equal("0");
	});

	it('Bank getBalance()', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getBalance(await wallet.getAddress());

		//expect(result).to.be.equal("0");
	});

	it('Bank getTokenBalance()', async () => {

		// for single usage
		const tokenID = "ukomx6"

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getTokenBalance(await wallet.getAddress(), tokenID);

		//console.log(result);

		//expect(result).to.be.equal("0");
	});

	it('Bank getTokenBalance() - not exist tokenID', async () => {

		// for single usage
		const tokenID = "ukomx6sdfakljfd"

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getTokenBalance(await wallet.getAddress(), tokenID);
		expect(result).to.be.equal("0");

		//console.log(result);
		//expect(result).to.be.equal("0");
	});


	it('Bank getTokenBalanceList()', async () => {

		// for wallet application
		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getTokenBalanceList(await wallet.getAddress());

		//console.log(result);
		//result[0].denom
		//result[0].amount
		//expect(result).to.be.equal("0");
	});

	it('Bank getSupply()', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getSupply();

		//console.log(result);
		//expect(result).to.be.equal("0");
	});

	it('Bank getTokenSupply()', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Bank.getTokenSupply("ukomx1670550348");

		//console.log(result);
		//expect(result).to.be.equal("0");
	});

});