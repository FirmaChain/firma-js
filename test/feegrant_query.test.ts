
import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[feegrant Query Test]', () => {

	const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
	const bobMnemonic = "burst torch enemy quick crime slogan trust wood hamster way armor visual common language close park leg ill ball board couch nose theory must";

	const firma = new FirmaSDK(TestChainConfig);

	it.skip('feegrant getGranteeAllowance', async () => {


		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var result = await firma.FeeGrant.getGranteeAllowance(await aliceWallet.getAddress(), await bobWallet.getAddress());
		/*console.log(result['@type']);
		console.log(result.spendLimit);
		console.log(result.expiration);*/

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