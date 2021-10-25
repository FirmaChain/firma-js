import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[19. chain Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('getChainStatus test', async () => {
		const result = await firma.BlockChain.getChainSyncInfo();
		//console.log(result);
	})

	it.skip('getTransactionByHash test', async () => {
		const txHash = "0x5DA9D094D15660D21947C9EEF1329CCB70117E7BCD3A451F27E5C7AFF5DB6DF0";
		const result = await firma.BlockChain.getTransactionByHash(txHash);

		//console.log(result);
		//console.log(result.tx_result.events[0]);

		// base64 decode to utf8
		//const key = Buffer.from(result.tx_result.events[0].attributes[0].key, "base64");
		//const value = Buffer.from(result.tx_result.events[0].attributes[0].value, "base64");

		// key: spender
		// value: firma1jmg3kwy5hntx66nl93dyk2d92943394qsf6gcf
		//console.log("key: " + key);
		//console.log("value: " + value);
	})
});