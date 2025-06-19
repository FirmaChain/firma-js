import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaWalletService } from "../sdk/FirmaWalletService";

import { aliceMnemonic, bobMnemonic, TestChainConfig } from "./config_test";

describe('[36. Bridge query Test]', () => {

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

	let bridgeContractAddress = ""

	it('cw bridge get_config', async () => {
		const result = await firma.CwBridge.getConfig(bridgeContractAddress);
		console.log(result);
	});

	it('cw bridge get_owner', async () => {
		const result = await firma.CwBridge.getOwner(bridgeContractAddress);
		console.log(result);
	});

	it('cw bridge get_authorized_user', async () => {
		const result = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		console.log(result);
	});

	it('cw bridge nft_info', async () => {
		const token_id = "15";

		// not exist token_id -> return null.
		const result = await firma.CwBridge.getNftInfo(bridgeContractAddress, token_id);
		console.log(result);
	});

	it('cw bridge owner_nfts', async () => {
		const result = await firma.CwBridge.getOwnerNfts(bridgeContractAddress, aliceAddress);
		console.log(result);
	});

	it('cw bridge owner_nfts_info', async () => {
		const result = await firma.CwBridge.getOwnerNftsInfo(bridgeContractAddress, aliceAddress);
		console.log(result);
	});

	it('cw bridge owner_withdrawable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerWithdrawableNfts(bridgeContractAddress, bobAddress);
		console.log(result);
	});

	it('cw bridge owner_unlockable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerUnlockableNfts(bridgeContractAddress, aliceAddress);
		console.log(result);
	});

	it('cw bridge global_tx_counts', async () => {
		const result = await firma.CwBridge.getGlobalTxCounts(bridgeContractAddress);
		console.log(result);
	});
});