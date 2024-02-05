import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { FirmaUtil } from "../dist";

describe('[37. Marketplace tx Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let cw721ContractAddress = "firma1mp3dl27wwhdkhkyed5d4ypaq7h5dewazqkqhny98sxcy2cpu23ls369adt";
	let cw20ContractAddress = "firma1w8jfdyfdwf39w8x3j0hs5zd70upfx3ez05sty0xf9ueewsxa9w5qd9t4cr"
	let marketplaceContractAddress = "firma1xzwdxkf24j8ggcdvntwp4vk66hy2nfy9rfwmnwfc5fpcv9xmtkyqphfh80"
	
	it.skip('Cw marketplace get config', async () => {
        const data = await firma.CwMarketplace.getConfig(marketplaceContractAddress);
		console.log(data);
	}),

	it.skip('Cw marketplace get owner', async () => {
        const data = await firma.CwMarketplace.getOwner(marketplaceContractAddress);
		console.log(data);
	}),

	it.skip('Cw marketplace get register list', async () => {

		const data = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(data);
	}),

	it.skip('Cw marketplace get item', async () => {

		const data = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(data);
	}),

})
