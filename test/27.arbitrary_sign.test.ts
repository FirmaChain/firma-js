import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { FirmaUtil } from '../sdk/FirmaUtil';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { BankTxClient } from '../sdk/firmachain/bank';

describe('[27. protobuf arbitrary sign]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	});

	it('protobuf arbitrary sign & verify basic test', async () => {

		const testMsg = "be14202e-46dc-4d38-924c-65db209ea2fb";

		const signatureResult = await FirmaUtil.experimentalAdr36Sign(aliceWallet, testMsg);
		
		const isMatch = await FirmaUtil.experimentalAdr36Verify(signatureResult, testMsg);

		expect(isMatch).to.be.equal(true);
	});

	it('direct sign & verify basic test', async () => {

		const amountFCT = 9;
		const alicePubkey = await aliceWallet.getPubKey();

		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});

		const stringSignDoc = await FirmaUtil.makeSignDocWithStringify(aliceAddress, alicePubkey, [msgSend]);
		const signDoc = FirmaUtil.parseSignDocValues(stringSignDoc);

		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		const extTxRaw = await commonTxClient.signDirectForSignDoc(aliceAddress, signDoc);

		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, extTxRaw.signature, signDoc);
		expect(valid).to.be.equal(true);
	});

	it('direct sign & verify & send basic test', async () => {

		const amountFCT = 9;
		const alicePubkey = await aliceWallet.getPubKey();

		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgSend = BankTxClient.msgSend({
			fromAddress: aliceAddress,
			toAddress: bobAddress,
			amount: [sendAmount]
		});
		
		const signDoc = await FirmaUtil.makeSignDoc(aliceAddress, alicePubkey, [msgSend]);
		const stringSignDoc:string = FirmaUtil.stringifySignDocValues(signDoc);

		const newSignDoc = FirmaUtil.parseSignDocValues(stringSignDoc);

		const commonTxClient = FirmaUtil.getCommonTxClient(aliceWallet);
		const extTxRaw = await commonTxClient.signDirectForSignDoc(aliceAddress, newSignDoc);

		const valid = await FirmaUtil.verifyDirectSignature(aliceAddress, extTxRaw.signature, newSignDoc);

		if (valid) {
			const result = await commonTxClient.broadcast(extTxRaw.txRaw);
			expect(result.code).to.be.equal(0);
		}

		expect(valid).to.be.equal(true);
	});
});
