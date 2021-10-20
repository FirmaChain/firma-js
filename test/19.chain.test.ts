import { expect } from 'chai';
import { FirmaUtil } from '../dist';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[19. chain Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('getChainStatus test', async () => {
		const result = await firma.BlockChain.getChainStatus();
		console.log(result)
	})

	it.skip('getTransactionByHash test', async () => {
		const txHash = "0xC5509A32CF57798F8C3185DFAF03BD2D09DFC04FE842283ECA9298F5F60E340F";
		const result = await firma.BlockChain.getTransactionByHash(txHash);
		console.log(result)
	})
});