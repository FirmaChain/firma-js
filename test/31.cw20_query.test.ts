import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil";
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[31. cw20 query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;
	let contractAddress: string;

	const codeId = "1";

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			decimals: 6,
			name: "MyToken",
			symbol: "MTK",
			initial_balances: [
				{
					address: aliceAddress,
					amount: "500000000000"
				},
				{
					address: bobAddress,
					amount: "500000000000"
				}
			],
			// mint is optional
			mint: {
				minter: aliceAddress,
				cap: "10000000000000"
			},
			// marketing is optional
			marketing: {
				description: "MyToken's description is like this.",
				logo: {
					"url": "https://example.com/mytoken-logo.png"
				},
				marketing: aliceAddress,
				project: "https://mytokenproject.com"
			}
		});

		var result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);

		contractAddress = data[0]["events"][0]["attributes"][0]["value"];
	})

	it('Cw20 getBalance', async () => {

		const balance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		
		console.log(balance);
	});

	it('Cw20 getBalance - no balance', async () => {

		const nobalance_address = "firma1d84pmnumnsh80v74lta0vnpd476ncp4pjnuklr";
		const balance = await firma.Cw20.getBalance(contractAddress, nobalance_address);
		
		console.log(balance);
	});

	it('Cw20 getTotalSupply', async () => {

		const totalSupply = await firma.Cw20.getTotalSupply(contractAddress);
		console.log(totalSupply);
	});

	it('Cw20 getTokenInfo', async () => {

		const tokenInfo = await firma.Cw20.getTokenInfo(contractAddress);
		console.log(tokenInfo);
	});

	it('Cw20 getMinter', async () => {

		const minter = await firma.Cw20.getMinter(contractAddress);
		
		console.log(minter);
	});

	it('Cw20 getAllowance', async () => {

		const info = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
	});

	it('Cw20 getAllAllowances', async () => {

		const info = await firma.Cw20.getAllAllowances(contractAddress, aliceAddress);
		
		//console.log(info);
	});

	it('Cw20 getAllSpenderAllowances', async () => {

		const info = await firma.Cw20.getAllSpenderAllowances(contractAddress, bobAddress);
		
		//console.log(info);
	});

	it('Cw20 getAllAccounts', async () => {

		const info = await firma.Cw20.getAllAccounts(contractAddress);
		//console.log(info);
	});

	it('Cw20 getMarketingInfo', async () => {

		const info = await firma.Cw20.getMarketingInfo(contractAddress);
		console.log(info);
	});

	it.skip('Cw20 getDownloadLogo', async () => {

		// INFO: Errors if no logo data is stored for this contract.
		try {
			const info = await firma.Cw20.getDownloadLogo(contractAddress);
		} catch (error) {
			console.log(error);
		}
		//console.log(info);
	});

	
});