import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[31. cw20 query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);
	})

	const contractAddress = "firma1fxkx7wd4q7z5zgm8qh0vaxptx4gp0ppgjm0ke56jr55azpzecpcsuexqg8";

	it('Cw20 getBalance', async () => {

		const address = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";
		const balance = await firma.Cw20.getBalance(contractAddress, address);
		
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

		const address = "firma1d84pmnumnsh80v74lta0vnpd476ncp4pjnuklr";
		const minter = await firma.Cw20.getMinter(contractAddress);
		
		console.log(minter);
	});

	it('Cw20 getAllowance', async () => {

		const owner = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";
		const spender = "firma1d84pmnumnsh80v74lta0vnpd476ncp4pjnuklr";

		const info = await firma.Cw20.getAllowance(contractAddress, owner, spender);		
		console.log(info);
	});

	it.skip('Cw20 getAllAllowances', async () => {

		const owner = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";
		const info = await firma.Cw20.getAllAllowances(contractAddress, owner);
		
		//console.log(info);
	});

	it.skip('Cw20 getAllSpenderAllowances', async () => {

		const spender = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";
		const info = await firma.Cw20.getAllSpenderAllowances(contractAddress, spender);
		
		//console.log(info);
	});

	it.skip('Cw20 getAllAccounts', async () => {

		const info = await firma.Cw20.getAllAccounts(contractAddress);
		//console.log(info);
	});

	it.skip('Cw20 getMarketingInfo', async () => {

		const info = await firma.Cw20.getMarketingInfo(contractAddress);
		//console.log(info);
	});

	it.skip('Cw20 getDownloadLogo', async () => {

		// INFO: Errors if no logo data is stored for this contract.
		const info = await firma.Cw20.getDownloadLogo(contractAddress);
		//console.log(info);
	});

	
});