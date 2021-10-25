import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[20. Slashing Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('getSlashingParam test', async () => {
		const result = await firma.Slashing.getSlashingParam();
		//console.log(result)
	})

	it('getSigningInfos test', async () => {
		const result = await firma.Slashing.getSigningInfos();
		//console.log(result)
	})

	it('getSigningInfo test', async () => {
		const infos = await firma.Slashing.getSigningInfos();
		const result = await firma.Slashing.getSigningInfo(infos[0].address);
		//console.log(result)
	})
});