import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[10. NFT Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('NFT Mint', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		// get nftId below code
		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		expect(result.code).to.be.equal(0);
	});

	it('NFT Transfer', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.Nft.mint(wallet, "https://naver.com");

		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		var result = await firma.Nft.transfer(wallet, await targetWallet.getAddress(), nftId);
		expect(result.code).to.be.equal(0);

	});

	it('NFT Burn', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		var result = await firma.Nft.burn(wallet, nftId);
		expect(result.code).to.be.equal(0);
	});
});