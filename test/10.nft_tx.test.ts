import { expect } from 'chai';
import { NftTxClient } from '../sdk/firmachain/nft';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[10. NFT Tx Test]', () => {

	let firma: FirmaSDK;
	
	const extractAllNftIds = (events: readonly any[]) => {
		const nftIds = [];

		for (const event of events) {
			if (event.type === 'message') {
				for (const attr of event.attributes) {
					if (attr.key === 'nftID') {
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

	it('NFT Mint', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		// get nftId below code
		const nftId = extractAllNftIds(result.events);
		// console.log(nftId);
		
		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const tx1 = await firma.Nft.getUnsignedTxMint(wallet, "https://naver1.com" );
		const tx2 = await firma.Nft.getUnsignedTxMint(wallet, "https://naver2.com" );
		const tx3 = await firma.Nft.getUnsignedTxMint(wallet, "https://naver3.com" );
		
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		let gas = await firma.Nft.getGasEstimationFromEncodeObject(wallet, txList);
		const fee = Math.ceil(gas * 0.1);
		console.log("gas :" + gas);
		console.log("fee :" + fee);

		var result = await firma.Nft.signAndBroadcast(wallet, txList, {gas: gas, fee: fee});

		// get nftId below code
		const nftIds = extractAllNftIds(result.events);
		console.log(nftIds);

		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK low level', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const address = await wallet.getAddress();

		const tx1 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver1.com" });
		const tx2 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver2.com" });
		const tx3 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver3.com" });
		
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		let gas = await firma.Nft.getGasEstimationFromEncodeObject(wallet, txList);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Nft.signAndBroadcast(wallet, txList, {gas: gas, fee: fee});

		// get nftId below code
		const nftIds = extractAllNftIds(result.events);
		console.log(nftIds);

		expect(result.code).to.be.equal(0);
	});

	it('NFT Transfer', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.Nft.mint(wallet, "https://naver.com");

		const nftIds = extractAllNftIds(result.events);

		var result = await firma.Nft.transfer(wallet, await targetWallet.getAddress(), nftIds[0]);
		expect(result.code).to.be.equal(0);

	});

	it('NFT Burn', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		const nftIds = extractAllNftIds(result.events);

		var result = await firma.Nft.burn(wallet, nftIds[0]);
		expect(result.code).to.be.equal(0);
	});
});