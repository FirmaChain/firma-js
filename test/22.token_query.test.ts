import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[22. Token query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Token getTokenDataListFromOwner', async () => {

		const address = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		var tokenDataList = await firma.Token.getTokenDataListFromOwner(address);
		//console.log(totalData);
		expect(tokenDataList.length).to.be.greaterThan(0);
	});

	it('Token getTokenData', async () => {

		const address = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		var tokenDataList = await firma.Token.getTokenDataListFromOwner(address);

		const tokenID = tokenDataList[0];

		var totalData = await firma.Token.getTokenData(tokenID);
		//console.log(totalData);

		expect(totalData.tokenID).to.be.equal(tokenID);
	});

	it('Token getTokenDataAll', async () => {

		var totalDataList = await firma.Token.getTokenDataAll();
		//console.log(totalDataList.dataList);
		//console.log(totalDataList.pagination);

		expect(totalDataList.dataList.length).to.be.greaterThan(0);
		//expect(totalNft).to.be.greaterThan(0);
	});
});