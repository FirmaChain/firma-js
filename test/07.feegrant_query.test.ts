
import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[07. Feegrant Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('feegrant getGranteeAllowance', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		try {
			await firma.FeeGrant.grantBasicAllowance(aliceWallet, await bobWallet.getAddress());
			const result = await firma.FeeGrant.getGranteeAllowance(await aliceWallet.getAddress(), await bobWallet.getAddress());
			await firma.FeeGrant.revokeAllowance(aliceWallet, await bobWallet.getAddress());
			
			expect(result).to.not.equal(null);
		} catch (error) {
			expect(false).to.be.equal(true);
		}
	});

	it('feegrant getGranteeAllowanceAll', async () => {

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const result = await firma.FeeGrant.getGranteeAllowanceAll(await bobWallet.getAddress());

		if (result.length === 0) {
			expect(true).to.be.equal(true);
		} else {
			expect(FirmaUtil.isValidAddress(result[0].granter)).to.be.equal(true);
		}
	});
});