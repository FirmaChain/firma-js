import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { BankTxClient } from '../sdk/firmachain/bank';
import { ArbitraryVerifyData } from '../sdk/firmachain/common/signingstargateclient';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[27. arbitary sign]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;
	let alicePubkey: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
		alicePubkey = await aliceWallet.getPubKey();
	})

	// https://docs.cosmos.network/master/architecture/adr-036-arbitrary-signature.html
	// https://github.com/cosmos/cosmjs/issues/844
	// https://github.com/cosmos/cosmjs/pull/847

	it('arbitary sign & verify basic test', async () => {

		const testMsg = "3936a4db-1d18-4cb6-8274-bccb1541f021";
		// create json to send (with sign)
		const signatureResult = await FirmaUtil.experimentalAdr36Sign(aliceWallet, testMsg);
		// send jsonstring to other client.
		const jsonString = JSON.stringify(signatureResult);
		const finalData: ArbitraryVerifyData = JSON.parse(jsonString);

		// error case
		// finalData.signer += "1";
		// finalData.data += "1";
		// finalData.type += "1";
		// testMsg += "1";
		const isMatch = await FirmaUtil.experimentalAdr36Verify(finalData, testMsg);
		expect(isMatch).to.be.equal(true);
	});

	it('direct sign & verify basic test', async () => {

		const amountFCT = 10;
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});

		// 1. Create signDoc beforehand to be used for direct signing and verification
		const signDoc = await FirmaUtil.makeSignDoc(aliceAddress, alicePubkey, [msgSend]);
		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		
		// 2. Use the exact same signDoc for signing
		const txRaw = await commonTxClient.signDirectForSignDocTxRaw(aliceAddress, signDoc);
		
		// 3. Verify the signature against the original signDoc
		const signatureBase64 = FirmaUtil.arrayBufferToBase64(txRaw.signatures[0]);

		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, signatureBase64, signDoc);
		expect(valid).to.be.equal(true);
	});

	it('direct sign & verify & send basic test', async () => {

		const amountFCT = 10;
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };
		const msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});
		
		// 1. Create the signDoc for signing
		const signDoc = await FirmaUtil.makeSignDoc(aliceAddress, alicePubkey, [msgSend]);
		
		// 2. Sign the signDoc directly using the wallet
		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		const txRaw = await commonTxClient.signDirectForSignDocTxRaw(aliceAddress, signDoc);

		// 3. Extract the base64 encoded signature
		const signatureBase64 = FirmaUtil.arrayBufferToBase64(txRaw.signatures[0]);

		// 4. Verify the signature with the signDoc and address
		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, signatureBase64, signDoc);
  	expect(valid).to.be.equal(true);

		// 5. Broadcast the signed transaction to the network
  	const result = await commonTxClient.broadcast(txRaw);
  	expect(result.code).to.be.equal(0);
	});
});