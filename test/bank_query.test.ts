import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaConfig } from "../sdk/FirmaConfig"

describe('[bank test]', () => {

	const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
	const targetMnemonic = "burst torch enemy quick crime slogan trust wood hamster way armor visual common language close park leg ill ball board couch nose theory must";

	const firma = new FirmaSDK(FirmaConfig.LocalDevNetConfig);;

	it('Get Balance() of a user who has never been created.', async () => {

		const wallet = await firma.Wallet.newWallet();

		var result = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result).to.be.equal("0");

		var result2 = await firma.Bank.getBalance(await wallet.getAddress());
		expect(result2).to.be.equal("0");
	});

});