import { expect } from 'chai';
import { NftTxClient } from '../sdk/firmachain/nft';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[10. NFT Tx Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('NFT Mint', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		// get nftId below code
		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const address = await wallet.getAddress();

		const tx1 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver1.com" });
		const tx2 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver2.com" });
		const tx3 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver3.com" });
		
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		let gas = await firma.Nft.getGasEstimationFromEncodeObject(wallet, txList);
		const fee = Math.ceil(gas * 0.1);
		//console.log("gas :" + gas);
		//console.log("fee :" + fee);

		var result = await firma.Nft.signAndBroadcast(wallet, txList, {gas: gas, fee: fee});

		// get nftId below code
		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		//console.log(nftId);

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