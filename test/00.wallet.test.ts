import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[00. Wallet Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
	})

	it('fromMnemonic check', async () => {
		expect(aliceWallet.getMnemonic()).to.equal(aliceMnemonic);
	});

	it('Wallet.fromPrivateKey check', async () => {
		const privateKey = "0x15bc0d2e445ef5b13f9d3c6d227f21524fd05d5afda713d1aff1ecc8db49a62d";
		const privateKeyFromWallet = (await firma.Wallet.fromPrivateKey(privateKey)).getPrivateKey();

		expect(privateKeyFromWallet).to.equal(privateKey);
	});

	it('Wallet.getPubKey check with new mnemonic', async () => {
		const randomMnemonic = "inmate stock silly toy divide example orchard harbor pulse gasp acquire bulk predict spin salon quiz record office party today narrow crumble remember sing";

		const wallet = await firma.Wallet.fromMnemonic(randomMnemonic);
		const pubkey = await wallet.getPubKey();

		expect(pubkey).to.equal("AvzyjjaXumyGNQR1DRkDdozJge+MPJPFuNaMr+DAK2ks");
	});
});