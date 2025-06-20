import { FirmaSDK } from '../sdk/FirmaSDK';
import { TestChainConfig } from './config_test';

describe('[20. Slashing Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('getSlashingParam test', async () => {
		const result = await firma.Slashing.getSlashingParam();
	});

	it('getSigningInfos test', async () => {
		const result = await firma.Slashing.getSigningInfos();
	});

	it('getSigningInfo test', async () => {
		const infos = await firma.Slashing.getSigningInfos();
		const result = await firma.Slashing.getSigningInfo(infos[0].address);
	});
});