
import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[07. Feegrant Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('feegrant getGranteeAllowance', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const bobAddress = await bobWallet.getAddress();

		await firma.FeeGrant.grantBasicAllowance(aliceWallet, bobAddress);
		const result = await firma.FeeGrant.getGranteeAllowance(await aliceWallet.getAddress(), await bobWallet.getAddress());
		await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress);
	});

	it('feegrant getGranteeAllowanceAll', async () => {

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.FeeGrant.getGranteeAllowanceAll(await bobWallet.getAddress());
		/*console.log(result[0].granter);
		console.log(result[0].grantee);
		console.log("total: " + result.length);

		console.log(result[0].allowance["@type"]);
		console.log(result[0].allowance.spendLimit);
		console.log(result[0].allowance.expiration);*/

		//expect(result.code).to.equal(0);
	});
});