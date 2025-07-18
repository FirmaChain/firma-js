
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

		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 1);

		const grantResult = await firma.FeeGrant.grantBasicAllowance(
			aliceWallet,
			bobAddress,
			{
				spendLimit: [{
					amount: "10000",
					denom: firma.Config.denom
				}],
				expiration: {
					seconds: BigInt(Math.floor(expirationDate.getTime() / 1000)),
					nanos: (expirationDate.getTime() % 1000) * 1000000
				}
			}
		);
		expect(grantResult.code).to.equal(0);

		const allowance = await firma.FeeGrant.getGranteeAllowance(aliceAddress, bobAddress);
		expect(allowance).to.not.equal(null);
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