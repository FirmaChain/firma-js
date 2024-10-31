import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[19. chain Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('getChainStatus test', async () => {
		const result = await firma.BlockChain.getChainSyncInfo();
		//console.log(result);
	})

	it('getTransactionByHash test', async () => {
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const bobAddress = await bobWallet.getAddress();
		const sendAmount = 1;

		const txResult = await firma.Bank.send(aliceWallet, bobAddress, sendAmount);
		const result = await firma.BlockChain.getTransactionByHash(`0x${txResult.transactionHash}`);

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

	it('getChainInfo test', async () => {
		const result = await firma.BlockChain.getChainInfo();
		//console.log(result);
		/*
		{
		chainId: 'imperium-4',
		appVersion: '0.3.5-beta3-1-g4a1ba1c',
		cosmosVersion: 'v0.45.9'
		}
		*/

	})
});