import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[21. Token Tx Test]', () => {

	let firma: FirmaSDK;

	const extractAllTokenIds = (events: readonly any[]) => {
		const nftIds = [];

		for (const event of events) {
			if (event.type === 'message') {
				for (const attr of event.attributes) {
					if (attr.key === 'TokenID') {
						nftIds.push(attr.value);
					}
				}
			}
		}

		return nftIds;
	}
	
	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

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

		try {
			var result = await firma.Token.createToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
			// get tokenID below code
			const tokenIds = extractAllTokenIds(result.events);

			console.log("tokenIds : " + tokenIds);
	
			expect(result.code).to.be.equal(0);
		} catch (error) {
			console.log(error);
		}
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