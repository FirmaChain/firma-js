
import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[07. Feegrant Query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	afterEach(async function() {
		await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
	})

	it('feegrant getGranteeAllowance', async () => {

		try {
			const expirationDate = new Date();
			expirationDate.setMonth(12);
			const grantResult = await firma.FeeGrant.grantBasicAllowance(aliceWallet, bobAddress, { expiration : expirationDate});
			expect(grantResult.code).to.equal(0);

			const allowance = await firma.FeeGrant.getGranteeAllowance(aliceAddress, bobAddress);
			expect(allowance).to.not.equal(null);
		} catch (error) {
			expect(false).to.be.equal(true);
		}
	});

	it('feegrant getGranteeAllowanceAll', async () => {

		const result = await firma.FeeGrant.getGranteeAllowanceAll(bobAddress);

		if (result.length === 0) {
			expect(true).to.be.equal(true);
		} else {
			expect(FirmaUtil.isValidAddress(result[0].granter)).to.be.equal(true);
		}
	});
});