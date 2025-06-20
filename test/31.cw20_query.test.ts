import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[31. cw20 query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	const contractAddress = "firma1fxkx7wd4q7z5zgm8qh0vaxptx4gp0ppgjm0ke56jr55azpzecpcsuexqg8";

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
		console.log(info);
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
		//console.log(info);
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