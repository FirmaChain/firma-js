import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { expect } from 'chai';

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

	let bridgeContractAddress = "firma1wqchrjh07e3kxaee59yrpzckwr94j03zchmdslypvkv6ps0684msjne5yu";

	it('cw bridge get_config', async () => {
		const result = await firma.CwBridge.getConfig(bridgeContractAddress);
		expect(result).to.have.property('owner');
		expect(result).to.have.property('cw721_address');
	});

	it('cw bridge get_owner', async () => {
		const result = await firma.CwBridge.getOwner(bridgeContractAddress);
		expect(FirmaUtil.isValidAddress(result)).to.be.equal(true);
	});

	it('cw bridge get_authorized_user', async () => {
		const result = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge nft_info', async () => {
		const token_id = "15";
		const result = await firma.CwBridge.getNftInfo(bridgeContractAddress, token_id);
		if (result !== null) {
			expect(result).to.have.property('owner');
			expect(result).to.have.property('token_id');
			expect(result).to.have.property('is_deposit');
		}
	});

	it('cw bridge owner_nfts', async () => {
		const result = await firma.CwBridge.getOwnerNfts(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_nfts_info', async () => {
		const result = await firma.CwBridge.getOwnerNftsInfo(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_withdrawable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerWithdrawableNfts(bridgeContractAddress, bobAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_unlockable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerUnlockableNfts(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge global_tx_counts', async () => {
		const result = await firma.CwBridge.getGlobalTxCounts(bridgeContractAddress);
		
		expect(result).to.have.property('lock_count');
		expect(result).to.have.property('unlock_count');
		expect(result).to.have.property('deposit_count');
		expect(result).to.have.property('withdraw_count');
	});
});