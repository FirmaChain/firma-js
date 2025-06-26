import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[01. Contract Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;
	
	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
	})

	it('Contract getUnsignedTxAddContractLog X 3 and signAndBroadcast', async () => {

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = aliceAddress;
		const jsonString = "{}";

		const tx = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		const result = await firma.Contract.signAndBroadcast(aliceWallet, [tx, tx, tx]);
		expect(result.code).equal(0);
	});

	it('Contract addContractLog', async () => {

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = aliceAddress;
		const jsonString = "{}";

		const result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		expect(result.code).equal(0);
	});

	it('Contract getUnsignedTxCreateContractFile x3 signAndBroadcast', async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random create

		const ownerAddress = aliceAddress;
		const ownerList = [ownerAddress, ownerAddress];
		const jsonString = "{}";

		const tx1 = await firma.Contract.getUnsignedTxCreateContractFile(aliceWallet, fileHash, timeStamp, ownerList, jsonString);
		const tx2 = await firma.Contract.getUnsignedTxCreateContractFile(aliceWallet, fileHash + "a", timeStamp, ownerList, jsonString);
		const tx3 = await firma.Contract.getUnsignedTxCreateContractFile(aliceWallet, fileHash + "b", timeStamp, ownerList, jsonString);

		const result = await firma.Contract.signAndBroadcast(aliceWallet, [tx1, tx2, tx3]);
		expect(result.code).equal(0);
	});

	it('Contract createContractFile', async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp;

		const ownerAddress = aliceAddress;
		const ownerList = [ownerAddress, ownerAddress];
		const jsonString = "{}";

		const result = await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, ownerList, jsonString);
		expect(result.code).equal(0);
	});
});