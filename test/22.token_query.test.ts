import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[22. Token query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
	})

	it('Token getTokenDataListFromOwner', async () => {

		const tokenDataList = await firma.Token.getTokenDataListFromOwner(aliceAddress);
		expect(tokenDataList.length).to.be.greaterThan(0);
	});

	it('Token getTokenData', async () => {

		const tokenDataList = await firma.Token.getTokenDataListFromOwner(aliceAddress);
		const tokenID = tokenDataList[0];

		const totalData = await firma.Token.getTokenData(tokenID);
		expect(totalData.tokenID).to.be.equal(tokenID);
	});

	it('Token getTokenDataAll', async () => {

		const totalDataList = await firma.Token.getTokenDataAll();
		expect(totalDataList.dataList.length).to.be.greaterThan(0);
	});
});