import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { FirmaUtil } from '../sdk/FirmaUtil';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { toUtf8 } from "@cosmjs/encoding";
import { ArbitraryVerifyData } from '..';

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
		const testBytes = toUtf8(testMsg);

		// Sign arbitrary data using FirmaUtil
		const result: ArbitraryVerifyData = await FirmaUtil.protobufArbitrarySign(aliceWallet, aliceAddress, testBytes);

		// Verify using FirmaUtil
		const isValid = await FirmaUtil.protobufArbitraryVerify(result, testBytes);
		expect(isValid).to.be.equal(true);
	});

	it('protobuf arbitrary sign - tampered message should fail', async () => {
		const testMsg = "original-message";
		const testBytes = toUtf8(testMsg);

		// Sign arbitrary data using FirmaUtil
		const result: ArbitraryVerifyData = await FirmaUtil.protobufArbitrarySign(aliceWallet, aliceAddress, testBytes);

		// tamper the original message
		const tamperedBytes = toUtf8("modified-message");
		const isValid = await FirmaUtil.protobufArbitraryVerify(result, tamperedBytes);
		expect(isValid).to.be.equal(false);
	});

	it('protobuf arbitrary sign - tampered signature should fail', async () => {
		const testMsg = "integrity-check";
		const testBytes = toUtf8(testMsg);

		// Sign arbitrary data using FirmaUtil
		const result: ArbitraryVerifyData = await FirmaUtil.protobufArbitrarySign(aliceWallet, aliceAddress, testBytes);

		// modify signature base64 (simulate corruption) - change first character
		// console.log("Original signature:", result.signature);
		result.signature = "X" + result.signature.substring(1);
		// console.log("Modified signature:", result.signature);

		const isValid = await FirmaUtil.protobufArbitraryVerify(result, testBytes);
		expect(isValid).to.be.equal(false);
	});
});
