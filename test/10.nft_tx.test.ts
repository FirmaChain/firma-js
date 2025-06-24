import { expect } from 'chai';
import { NftTxClient } from '../sdk/firmachain/nft';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

describe('[10. NFT Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

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
	
	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
	})

	it('NFT Mint', async () => {

		const result = await firma.Nft.mint(aliceWallet, "https://naver.com");
		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK', async () => {

		const tx1 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver1.com" );
		const tx2 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver2.com" );
		const tx3 = await firma.Nft.getUnsignedTxMint(aliceWallet, "https://naver3.com" );
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		const gas = await firma.Nft.getGasEstimationFromEncodeObject(aliceWallet, txList);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Nft.signAndBroadcast(aliceWallet, txList, {gas: gas, fee: fee});
		expect(result.code).to.be.equal(0);
	});

	it('NFT Mint - BULK low level', async () => {

		const tx1 = NftTxClient.msgMint({ owner: aliceAddress, tokenURI: "https://naver1.com" });
		const tx2 = NftTxClient.msgMint({ owner: aliceAddress, tokenURI: "https://naver2.com" });
		const tx3 = NftTxClient.msgMint({ owner: aliceAddress, tokenURI: "https://naver3.com" });
		const txList = [tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3, tx1, tx2, tx3];

		const gas = await firma.Nft.getGasEstimationFromEncodeObject(aliceWallet, txList);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Nft.signAndBroadcast(aliceWallet, txList, {gas: gas, fee: fee});
		expect(result.code).to.be.equal(0);
	});

	it('NFT Transfer', async () => {

		const mintResult = await firma.Nft.mint(aliceWallet, "https://naver.com");
		const nftIds = extractAllNftIds(mintResult.events);

		const transferResult = await firma.Nft.transfer(aliceWallet, bobAddress, nftIds[0]);
		expect(transferResult.code).to.be.equal(0);
	});

	it('NFT Burn', async () => {

		const mintResult = await firma.Nft.mint(aliceWallet, "https://naver.com");
		expect(mintResult.code).to.be.equal(0);
		const nftIds = extractAllNftIds(mintResult.events);

		const burnResult = await firma.Nft.burn(aliceWallet, nftIds[0]);
		expect(burnResult.code).to.be.equal(0);
	});
});