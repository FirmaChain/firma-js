import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { PeriodicAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { FirmaUtil } from '../sdk/FirmaUtil';

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
	});

	it('feegrant RevokeAllowance tx', async () => {

		const result = await firma.FeeGrant.revokeAllowance(aliceWallet, await bobWallet.getAddress());
		expect(result.code).to.equal(0);
	});

	it('feegrant GrantBasicAllowance tx', async () => {
		
		// Use spend limit without expiration date
		const result = await firma.FeeGrant.grantBasicAllowance(
			aliceWallet, 
			bobAddress, 
			{
				spendLimit: [{
					denom: firma.Config.denom,
					amount: "10000"
				}]
			}
		);
		expect(result.code).to.be.equal(0);

		const revokeResult = await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
		expect(revokeResult.code).to.be.equal(0);
	});

	it('feegrant send tx', async () => {

		try {
			await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
		} catch (error) {}

		const spendAmount = FirmaUtil.getUFCTStringFromFCTStr("10");
		const amount = 0.1;
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 20);

		const periodicAllowanceData: PeriodicAllowance = {
			basic: {
				spendLimit: [
					{ amount: spendAmount, denom: firma.Config.denom }
				]
			},
			period: { seconds: BigInt(60 * 60 * 24), nanos: 0 },
			periodSpendLimit: [
				{ amount: spendAmount, denom: firma.Config.denom }
			],
			periodCanSpend: [
				{ amount: spendAmount, denom: firma.Config.denom }
			],
			periodReset: {
				seconds: BigInt(Math.floor(expirationDate.getTime() / 1000)),
				nanos: (expirationDate.getTime() % 1000) * 1000000
			}
		};
		const grantResult = await firma.FeeGrant.grantPeriodicAllowance(aliceWallet, bobAddress, periodicAllowanceData);
		expect(grantResult.code).to.equal(0);

		const sendResult = await firma.Bank.send(bobWallet, aliceAddress, amount, { feeGranter: aliceAddress });
		expect(sendResult.code).to.equal(0);
		
		const revokeResult = await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
		expect(revokeResult.code).to.equal(0);
	});
});