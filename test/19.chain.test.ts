import { FirmaSDK } from '../sdk/FirmaSDK';
import { TestChainConfig } from './config_test';

describe('[19. chain Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('getChainStatus test', async () => {
		const result = await firma.BlockChain.getChainSyncInfo();
	});

	// This test requires a meaningful transaction hash, so it is skipped by default.
	it.skip('getTransactionByHash test', async () => {
		const txHash = "0x5DA9D094D15660D21947C9EEF1329CCB70117E7BCD3A451F27E5C7AFF5DB6DF0";
		const result = await firma.BlockChain.getTransactionByHash(txHash);
	});

	it('getChainInfo test', async () => {
		const result = await firma.BlockChain.getChainInfo();

	});
});