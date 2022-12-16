import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

import { ArbitraryVerifyData } from '../sdk/firmachain/common/signingaminostargateclient';
import { BankTxClient } from '../sdk/firmachain/bank';

describe('[27. arbitary sign]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

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

		// error case
		// finalData.signer += "1";
		// finalData.data += "1";
		// finalData.type += "1";
		// testMsg += "1";

		let isMatch = await FirmaUtil.experimentalAdr36Verify(finalData, testMsg);
		//console.log(isMatch);

		expect(isMatch).to.be.equal(true);
	});


	it('direct sign & verify basic test', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const amountFCT = 9;
		const aliceAddress = await aliceWallet.getAddress();
		const alicePubkey = await aliceWallet.getPubKey();

		const bobAddress = await bobWallet.getAddress();

		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		let msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});

		let stringSignDoc = await FirmaUtil.makeSignDocWithStringify(aliceAddress, alicePubkey, [msgSend]);

		//console.log("--------------------------------");

		let signDoc = FirmaUtil.parseSignDocValues(stringSignDoc);

		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		let extTxRaw = await commonTxClient.signDirectForSignDoc(aliceAddress, signDoc);

		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, extTxRaw.signature, signDoc);
		expect(valid).to.be.equal(true);
	});

	it('direct sign & verify & send basic test', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const amountFCT = 9;
		const aliceAddress = await aliceWallet.getAddress();
		const alicePubkey = await aliceWallet.getPubKey();

		const bobAddress = await bobWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		let msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});
		
		let signDoc = await FirmaUtil.makeSignDoc(aliceAddress, alicePubkey, [msgSend]);
		let stringSignDoc:string = FirmaUtil.stringifySignDocValues(signDoc);

		//console.log("--------------------------------");

		let newSignDoc = FirmaUtil.parseSignDocValues(stringSignDoc);

		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		let extTxRaw = await commonTxClient.signDirectForSignDoc(aliceAddress, newSignDoc);

		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, extTxRaw.signature, newSignDoc);

		if (valid) {
			let result = await commonTxClient.broadcast(extTxRaw.txRaw);
			//console.log(result);

			expect(result.code).to.be.equal(0);
		}

		expect(valid).to.be.equal(true);
	});
});
