import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { NftItemType } from '../sdk/firmachain/nft';
import { TestChainConfig } from './config_test';

describe('[NFT Test]', () => {

	const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
	const firma = new FirmaSDK(TestChainConfig);

	it('NFT getBalanceOf', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var totalNft = await firma.Nft.getBalanceOf((await wallet.getAddress()));

		expect(totalNft).to.be.equal(totalNft);
		expect(totalNft).to.be.greaterThan(0);
	});

	it('NFT getTokenOfOwnerByIndex', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		var nftItem = await firma.Nft.getTokenOfOwnerByIndex(await wallet.getAddress(), 0);
		//expect(totalNft).to.be.greaterThan(0);
		expect(nftItem.id).not.equal("");
	});

	it('NFT getNftItemAllFromAddress-Pagination', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var address = await wallet.getAddress();

		var result = await firma.Nft.getNftItemAllFromAddress(address);
		const total = result.pagination.total;

		var totalItemList: NftItemType[] = [];
		var index = 0;

		while (result.pagination.next_key != "") {

			for (var i = 0; i < result.dataList.length; i++) {
				totalItemList[index++] = result.dataList[i];
			}

			result = await firma.Nft.getNftItemAllFromAddress(address, result.pagination.next_key);
		}

		for (var i = 0; i < result.dataList.length; i++) {
			totalItemList[index++] = result.dataList[i];
		}

		expect(totalItemList.length).to.be.equal(total);
	});


	it('NFT getNftItemAllFromAddress', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		var nftItemList = await firma.Nft.getNftItemAllFromAddress(await wallet.getAddress());

		expect(nftItemList.dataList.length).to.be.equal(nftItemList.dataList.length);

		//expect(nftItemList.dataList.length).to.be.equal(100);
		expect(nftItemList.dataList.length).to.be.greaterThan(0);
	});

	it('NFT getNftItemAll-pagination', async () => {

		var result = await firma.Nft.getNftItemAll();

		const total = result.pagination.total;

		var totalItemList: NftItemType[] = [];
		var index = 0;

		while (result.pagination.next_key != null) {

			for (var i = 0; i < result.dataList.length; i++) {
				totalItemList[index++] = result.dataList[i];
			}

			result = await firma.Nft.getNftItemAll(result.pagination.next_key);
		}

		//expect(totalItemList.dataList.length).to.be.equal(100);
		for (var i = 0; i < result.dataList.length; i++) {
			totalItemList[index++] = result.dataList[i];
		}

		expect(totalItemList.length).to.be.equal(total);
	});

	it('NFT getNftItemAll', async () => {

		var result = await firma.Nft.getNftItemAll();

		expect(result.dataList.length).to.be.equal(result.dataList.length);
		expect(result.dataList.length).to.be.greaterThan(0);
	});
});