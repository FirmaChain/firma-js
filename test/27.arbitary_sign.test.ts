import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[27. arbitary sign]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	// https://docs.cosmos.network/master/architecture/adr-036-arbitrary-signature.html
	// https://github.com/cosmos/cosmjs/issues/844
	// https://github.com/cosmos/cosmjs/pull/847

	it('arbitary sign & verify basic test', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let aliceAddress = await aliceWallet.getAddress();

		const rawCertificate = "3936a4db-1d18-4cb6-8274-bccb1541f021";
		let certificateData = "The signature requested by exchange.\n\nProceed to confirm your own ownership of Kepler's wallet.\nPlease proceed after checking the registered wallet address at the time of deposit and withdrawal.\n\nAddress:\n" + aliceAddress + "\nCertificate:\n" + rawCertificate;

		let dataBuffer = Buffer.from(certificateData);
		//console.log(dataBuffer);

		let signatureResult = await FirmaUtil.experimentalAdr36Sign(aliceWallet, dataBuffer);
		/*console.log(signatureResult);

		console.log("signer: " + signatureResult.msg[0].value.signer);
		console.log("data: " + signatureResult.msg[0].value.data);
		console.log("[source start]=============================");
		console.log(atob(signatureResult.msg[0].value.data))
		console.log("[source end]=============================");
		*/
		
		let signatureResul2t = await FirmaUtil.experimentalAdr36Verify(signatureResult);
		//console.log(signatureResul2t);

		expect(signatureResul2t).to.be.equal(true);
	});
});