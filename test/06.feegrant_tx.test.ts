import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

describe('[06. Feegrant Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
	})

	it('feegrant GrantPeriodicAllowance tx', async () => {
		
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 20);

		const periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: 2000,
			periodCanSpend: 10000,
			periodReset: expirationDate
		};

		const result = await firma.FeeGrant.grantPeriodicAllowance(aliceWallet, bobAddress, periodicAllowanceData);
		expect(result.code).to.equal(0);
	});

	it('feegrant RevokeAllowance tx', async () => {

		const result = await firma.FeeGrant.revokeAllowance(aliceWallet, await bobWallet.getAddress());
		expect(result.code).to.equal(0);
	});

	it('feegrant GrantBasicAllowance tx', async () => {

		const expirationDate = new Date();
		expirationDate.setMonth(12);

		// var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {spendLimit : spendLimit, expiration : expirationDate});
		// var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {expiration : expirationDate});
		// var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {spendLimit : spendLimit});
		const result = await firma.FeeGrant.grantBasicAllowance(aliceWallet, bobAddress, { expiration : expirationDate});
		expect(result.code).to.be.equal(0);

		const revokeResult = await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
		expect(revokeResult.code).to.be.equal(0);
	});

	it('feegrant send tx', async () => {

		const amount = 0.1;
		// await firma.FeeGrant.grantBasicAllowance()
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 20);

		const periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: 1000000,
			periodCanSpend: 200000,
			periodReset: expirationDate
		};
		const grantResult = await firma.FeeGrant.grantPeriodicAllowance(aliceWallet, bobAddress, periodicAllowanceData);
		expect(grantResult.code).to.equal(0);

		const sendResult = await firma.Bank.send(bobWallet, aliceAddress, amount, { feeGranter: aliceAddress });
		expect(sendResult.code).to.equal(0);
		
		const revokeResult = await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
		expect(revokeResult.code).to.equal(0);
	});
});