import { decodeSignature } from '@cosmjs/amino';
import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, TestChainConfig } from './config_test';

import { ArbitraryVerifyData } from '../sdk/firmachain/common/signingaminostargateclient';

describe('[27. arbitary sign]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	// https://docs.cosmos.network/master/architecture/adr-036-arbitrary-signature.html
	// https://github.com/cosmos/cosmjs/issues/844
	// https://github.com/cosmos/cosmjs/pull/847

	it('arbitary sign & verify basic test', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let testMsg = "3936a4db-1d18-4cb6-8274-bccb1541f021";

		// create json to send (with sign)
		let signatureResult = await FirmaUtil.experimentalAdr36Sign(aliceWallet, testMsg);
		
		// send jsonstring to other client.
		let jsonString = JSON.stringify(signatureResult);

		let finalData: ArbitraryVerifyData = JSON.parse(jsonString);
		//console.log(finalData);

		// error case
		// finalData.signer += "1";
		// finalData.data += "1";
		// finalData.type += "1";
		// testMsg += "1";
		
		let isMatch = await FirmaUtil.experimentalAdr36Verify(finalData, testMsg);
		//console.log(isMatch);

		expect(isMatch).to.be.equal(true);
	});
});