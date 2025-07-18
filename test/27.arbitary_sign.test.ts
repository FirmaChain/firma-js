import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { toUtf8 } from "@cosmjs/encoding";
import { ITxClient } from '../sdk/firmachain/common/ITxClient';
import { ArbitraryVerifyData } from '..';
import { CommonTxClient } from '../sdk/firmachain/common/CommonTxClient';

describe('[28. protobuf arbitrary sign]', () => {

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
		const txClient = new ITxClient(aliceWallet, firma.Config.rpcAddress, CommonTxClient.getRegistry());

		const testMsg = "be14202e-46dc-4d38-924c-65db209ea2fb";
		const testBytes = toUtf8(testMsg);

		// Sign arbitrary data
		const result: ArbitraryVerifyData = await txClient.experimentalProtobufArbitrarySign(aliceAddress, testBytes);

		// Verify
		const isValid = await ITxClient.experimentalProtobufArbitraryVerify(result, testBytes);
		expect(isValid).to.be.equal(true);
	});

	it('protobuf arbitrary sign - tampered message should fail', async () => {
		const txClient = new ITxClient(aliceWallet, firma.Config.rpcAddress, CommonTxClient.getRegistry());

		const testMsg = "original-message";
		const testBytes = toUtf8(testMsg);

		const result: ArbitraryVerifyData = await txClient.experimentalProtobufArbitrarySign(aliceAddress, testBytes);

		// tamper the original message
		const tamperedBytes = toUtf8("modified-message");
		const isValid = await ITxClient.experimentalProtobufArbitraryVerify(result, tamperedBytes);
		expect(isValid).to.be.equal(false);
	});

	it('protobuf arbitrary sign - tampered signature should fail', async () => {
		const txClient = new ITxClient(aliceWallet, firma.Config.rpcAddress, CommonTxClient.getRegistry());

		const testMsg = "integrity-check";
		const testBytes = toUtf8(testMsg);

		const result: ArbitraryVerifyData = await txClient.experimentalProtobufArbitrarySign(aliceAddress, testBytes);

		// modify signature base64 (simulate corruption) - change first character
		// console.log("Original signature:", result.signature);
		result.signature = "X" + result.signature.substring(1);
		// console.log("Modified signature:", result.signature);

		const isValid = await ITxClient.experimentalProtobufArbitraryVerify(result, testBytes);
		expect(isValid).to.be.equal(false);
	});
});
