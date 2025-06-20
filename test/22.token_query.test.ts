import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[22. Token query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Token getTokenDataListFromOwner', async () => {

		const address = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const tokenDataList = await firma.Token.getTokenDataListFromOwner(address);
		expect(tokenDataList.length).to.be.greaterThan(0);
	});

	it('Token getTokenData', async () => {

		const address = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const tokenDataList = await firma.Token.getTokenDataListFromOwner(address);
		const tokenID = tokenDataList[0];

		const totalData = await firma.Token.getTokenData(tokenID);
		expect(totalData.tokenID).to.be.equal(tokenID);
	});

	it('Token getTokenDataAll', async () => {

		const totalDataList = await firma.Token.getTokenDataAll();
		expect(totalDataList.dataList.length).to.be.greaterThan(0);
	});
});