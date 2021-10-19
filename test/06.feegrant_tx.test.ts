import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[06. Feegrant Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('feegrant GrantPeriodicAllowance tx', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const spendLimit = 200000;
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 2);

		let periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: 2000,
			periodCanSpend: 10000,
			periodReset: expirationDate
		};

		var result = await firma.FeeGrant.grantPeriodicAllowance(aliceWallet, await bobWallet.getAddress(), periodicAllowanceData);

		expect(result.code).to.equal(0);
	});

	it('feegrant RevokeAllowanec tx1', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.FeeGrant.revokeAllowance(aliceWallet, await bobWallet.getAddress());
		//console.log(result);

		expect(result.code).to.equal(0);
	});


	it('feegrant GrantBasicAllowance tx', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var expirationDate = new Date();
		expirationDate.setMonth(12);

		var spendLimit = 200000;

		//var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {spendLimit : spendLimit, expiration : expirationDate});
		//var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {expiration : expirationDate});
		//var result = await firma.FeeGrant.GrantBasicAllowance(aliceWallet, await bobWallet.getAddress(), {spendLimit : spendLimit});
		var result = await firma.FeeGrant.grantBasicAllowance(aliceWallet, await bobWallet.getAddress());

		expect(result.code).to.equal(0);
	});

	it('feegrant send tx', async () => {

		const alicewallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 1;

		var result = await firma.Bank.send(bobWallet, await alicewallet.getAddress(), amount, { feeGranter: await alicewallet.getAddress() });
		// console.log(result);

		expect(result.code).to.equal(0);
	});


	it('feegrant RevokeAllowance tx', async () => {

		const alicewallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.FeeGrant.revokeAllowance(alicewallet, await bobWallet.getAddress());
		//console.log(result);

		expect(result.code).to.equal(0);
	});
});