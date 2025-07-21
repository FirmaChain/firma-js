import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaConfig } from '../sdk/FirmaConfig';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic } from './config_test';

describe.skip('[38. Marketplace query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let cw721ContractAddress = "";
	let cw20ContractAddress = "";
	let marketplaceContractAddress = "";
	
	it('Cw marketplace get config', async () => {
        const data = await firma.CwMarketplace.getConfig(marketplaceContractAddress);
		console.log(data);
	}),

	it('Cw marketplace get owner', async () => {
        const data = await firma.CwMarketplace.getOwner(marketplaceContractAddress);
		console.log(data);
	}),

	it('Cw marketplace get register list', async () => {

		const limit = 10;
		const start_after = "59";

		const data = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress, limit, start_after);
		console.log(data);
	}),

	it('Cw marketplace get item', async () => {

		const limit = 10;
		const start_after = "59";

		const data = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress, limit, start_after);
		console.log(data);
	})
})
