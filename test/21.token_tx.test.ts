import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[21. Token Tx Test]', () => {

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

	const timeStamp = Math.round(+new Date() / 1000);
	const symbol = "KOMX" + timeStamp;
	const tokenID = "ukomx" + timeStamp;
	const tokenName = "KOMX TOKEN" + + timeStamp;

	const tokenURI = "https://naver.com";
	const totalSupply = 10000000;
	const decimal = 6;
	const mintable = true;
	const burnable = true;

	it('Token CreateToken', async () => {
		
		const result = await firma.Token.createToken(aliceWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(result.code).to.be.equal(0);
	});

	it('Token Mint', async () => {

		const amount = 100000;
		const result = await firma.Token.mint(aliceWallet, tokenID, amount, decimal, aliceAddress);
		expect(result.code).to.be.equal(0);
	});

	it('Token Burn', async () => {

		const amount = 10;
		const result = await firma.Token.burn(aliceWallet, tokenID, amount, decimal);
		expect(result.code).to.be.equal(0);
	});

	it('Token UpdateTokenURI', async () => {

		const tokenURI = "https://firmachain.com";
		const result = await firma.Token.updateTokenURI(aliceWallet, tokenID, tokenURI);
		expect(result.code).to.be.equal(0);
	});

	// token send from bank module
	it('bank sendToken OK', async () => {

		const amount = 100;
		const result = await firma.Bank.sendToken(aliceWallet, bobAddress, tokenID, amount, decimal);
		expect(result.code).to.equal(0);
	});
});