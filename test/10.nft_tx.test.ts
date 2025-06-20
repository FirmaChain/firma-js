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

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(aliceWallet, "https://naver.com");
		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const tx1 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver1.com" );
		const tx2 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver2.com" );
		const tx3 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver3.com" );
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		const gas = await firma.Nft.getGasEstimationFromEncodeObject(aliceWallet, txList);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Nft.signAndBroadcast(aliceWallet, txList, {gas: gas, fee: fee});
		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK low level', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const address = await aliceWallet.getAddress();

		const tx1 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver1.com" });
		const tx2 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver2.com" });
		const tx3 = NftTxClient.msgMint({ owner: address, tokenURI: "https://naver3.com" });
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		const gas = await firma.Nft.getGasEstimationFromEncodeObject(aliceWallet, txList);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Nft.signAndBroadcast(aliceWallet, txList, {gas: gas, fee: fee});
		expect(result.code).to.be.equal(0);
	});

	it('NFT Transfer', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.Nft.mint(aliceWallet, "https://naver.com");
		const nftIds = extractAllNftIds(result.events);

		var result = await firma.Nft.transfer(aliceWallet, await targetWallet.getAddress(), nftIds[0]);
		expect(result.code).to.be.equal(0);
	});

	it('NFT Burn', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(aliceWallet, "https://naver.com");

		const nftIds = extractAllNftIds(result.events);

		var result = await firma.Nft.burn(aliceWallet, nftIds[0]);
		expect(result.code).to.be.equal(0);
	});
});