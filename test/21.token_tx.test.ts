import { expect } from 'chai';
import { ContractService } from '../sdk/FirmaContractService';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[21. Token Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	let timeStamp = Math.round(+new Date() / 1000);

	const symbol = "KOMX" + timeStamp;
	const tokenID = "ukomx" + timeStamp;
	const tokenName = "KOMX TOKEN" + + timeStamp;

	it('Token CreateToken', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const tokenURI = "https://naver.com";
		const totalSupply = 10000000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		var result = await firma.Token.createToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);

		// get tokenID below code
		var jsonData = JSON.parse(result.rawLog!);
		var tokenID = jsonData[0]["events"][3]["attributes"][3]["value"];

		//console.log("tokenID : " + tokenID);

		expect(result.code).to.be.equal(0);
	});

	it('Token Mint', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const amount = 100000;
		const toAddress = await wallet.getAddress();
		const decimal = 6;

		var result = await firma.Token.mint(wallet, tokenID, amount, decimal, toAddress);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Token Burn', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const amount = 10;
		const decimal = 6;

		var result = await firma.Token.burn(wallet, tokenID, amount, decimal);

		//console.log(result);
		expect(result.code).to.be.equal(0);
	});

	it('Token UpdateTokenURI', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const tokenURI = "https://firmachain.com";

		var result = await firma.Token.updateTokenURI(wallet, tokenID, tokenURI);

		// console.log(result);
		expect(result.code).to.be.equal(0);

	});

	// token send from bank module
	it('bank sendToken OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();
		const amount = 100;
		const decimal = 6;

		var result = await firma.Bank.sendToken(wallet, bobAddress, tokenID, amount, decimal);

		//console.log(result);
		expect(result.code).to.equal(0);
	});
});