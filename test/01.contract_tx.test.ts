import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[Contract Tx Test]', () => {

	const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
	const firma = new FirmaSDK(TestChainConfig);

	it('Contract getUnsignedTxAddContractLog X 3 and signAndBroadcast', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let contractHash = "0xsalkdjfasldkjf2";
		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CreateContract";
		let ownerAddress = await wallet.getAddress();
		let jsonString = "{}";

		var tx = await firma.Contract.getUnsignedTxAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		var result = await firma.Contract.signAndBroadcast(wallet, [tx, tx, tx]);
		expect(result.code).equal(0);
	});

	it('Contract addContractLog', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let contractHash = "0xsalkdjfasldkjf2";
		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CreateContract";
		let ownerAddress = await wallet.getAddress();
		let jsonString = "{}";

		var result = await firma.Contract.addContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString, { memo: "", fee: 3000, gas: 200000 });
		expect(result.code).equal(0);
	});

	it('Contract getUnsignedTxCreateContractFile x3 signAndBroadcast', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let timeStamp = Math.round(+new Date() / 1000);
		let fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random create

		let ownerAddress = await wallet.getAddress();
		let ownerList = [ownerAddress, ownerAddress];
		let jsonString = "{}";

		var tx1 = await firma.Contract.getUnsignedTxCreateContractFile(wallet, fileHash, timeStamp, ownerList, jsonString);
		var tx2 = await firma.Contract.getUnsignedTxCreateContractFile(wallet, fileHash + "a", timeStamp, ownerList, jsonString);
		var tx3 = await firma.Contract.getUnsignedTxCreateContractFile(wallet, fileHash + "b", timeStamp, ownerList, jsonString);

		var result = await firma.Contract.signAndBroadcast(wallet, [tx1, tx2, tx3]);
		expect(result.code).equal(0);
	});

	it('Contract createContractFile', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let timeStamp = Math.round(+new Date() / 1000);
		let fileHash = "0xklsdjflaksjflaksjf" + timeStamp;

		let ownerAddress = await wallet.getAddress();
		let ownerList = [ownerAddress, ownerAddress];
		let jsonString = "{}";

		var result = await firma.Contract.createContractFile(wallet, fileHash, timeStamp, ownerList, jsonString);
		expect(result.code).equal(0);
	});
});