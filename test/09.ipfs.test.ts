import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[09. IPFS Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('ipfs test', async () => {

		let hash = await firma.Ipfs.addJson("hello world");
		expect(hash).to.equal("Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD");

		const arrBuf = new ArrayBuffer(1000);
		hash = await firma.Ipfs.addBuffer(arrBuf);
		let url = firma.Ipfs.getURLFromHash(hash);

		let srcUrl = firma.Config.ipfsWebApiAddress + "/ipfs/QmVRqQTWMy2gNtNd8i9ugz8STaoZmFGYg6fn5YyEBHp9Be";
		expect(srcUrl).to.equal(url);

		hash = await firma.Ipfs.addFile("./test/sample/test-bear.jpg");
		url = firma.Ipfs.getURLFromHash(hash);
		srcUrl = firma.Config.ipfsWebApiAddress + "/ipfs/QmYsezxzunake9EmyoU4HsWKEyHQLgE3syTEpTSQEhNChA";

		expect(srcUrl).to.equal(url);
	});
});