import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { NftItemType } from '../sdk/firmachain/nft';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[11. NFT Query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
	})

	it('NFT getBalanceOf', async () => {

		const totalNft = await firma.Nft.getBalanceOf(aliceAddress);

		expect(totalNft).to.be.equal(totalNft);
		expect(totalNft).to.be.greaterThan(0);
	});

	it('NFT getNftIdListOfOwner', async () => {

		const result = await firma.Nft.getNftIdListOfOwner(aliceAddress);
		expect(result.nftIdList.length).to.be.greaterThan(0);
	});

	it('NFT getNftItemAllFromAddress-Pagination', async () => {

		let result = await firma.Nft.getNftItemAllFromAddress(aliceAddress);
		const total = result.pagination.total;

		let current = result.dataList.length;

		while (result.pagination.next_key != "" && result.pagination.next_key != null) {
			result = await firma.Nft.getNftItemAllFromAddress(aliceAddress, result.pagination.next_key);
			current += result.dataList.length;
		}

		expect(current).to.be.equal(total);
	});

	it('NFT getNftItemAllFromAddress', async () => {

		const nftItemList = await firma.Nft.getNftItemAllFromAddress(aliceAddress);
		expect(nftItemList.dataList.length).to.be.greaterThan(0);
	});

	it('NFT getNftItemAll-pagination', async () => {

		let result = await firma.Nft.getNftItemAll();

		const total = result.pagination.total;

		let totalItemList: NftItemType[] = [];
		let index = 0;

		while (result.pagination.next_key != null) {
			for (let i = 0; i < result.dataList.length; i++) {
				totalItemList[index++] = result.dataList[i];
			}

			result = await firma.Nft.getNftItemAll(result.pagination.next_key);
		}

		for (let i = 0; i < result.dataList.length; i++) {
			totalItemList[index++] = result.dataList[i];
		}

		expect(totalItemList.length).to.be.equal(total);
	});

	it('NFT getNftItemAll', async () => {

		const result = await firma.Nft.getNftItemAll();

		expect(result.dataList.length).to.be.equal(result.dataList.length);
		expect(result.dataList.length).to.be.greaterThan(0);
	});
});