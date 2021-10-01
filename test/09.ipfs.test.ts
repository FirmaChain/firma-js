import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[IPFS Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('ipfs test', async () => {

		var hash = await firma.Ipfs.addJson("hello world");
		expect(hash).to.equal("Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD");

		var ee = new ArrayBuffer(1000);
		var hash = await firma.Ipfs.addBuffer(ee);
		var url = firma.Ipfs.getURLFromHash(hash);

		expect(url).to.equal("https://ipfs-firma-devnet.firmachain.org/ipfs/QmVRqQTWMy2gNtNd8i9ugz8STaoZmFGYg6fn5YyEBHp9Be");

		hash = await firma.Ipfs.addFile("./test/sample/test-bear.jpg");
		url = firma.Ipfs.getURLFromHash(hash);

		expect(url).to.equal("https://ipfs-firma-devnet.firmachain.org/ipfs/QmYsezxzunake9EmyoU4HsWKEyHQLgE3syTEpTSQEhNChA");
	});
});