import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { ContractFileType, ContractLogType } from '../sdk/firmachain/contract';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[02. Contract Query Test]', () => {

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

	it('Contract getContractLogAll-pagination', async () => {

		let result = await firma.Contract.getContractLogAll();
		const total = result.pagination.total;
		const totalItemList: ContractLogType[] = [];
		let index = 0;

		while (result.pagination.next_key != null) {
			for (let i = 0; i < result.dataList.length; i++) {
				totalItemList[index++] = result.dataList[i];
			}
			result = await firma.Contract.getContractLogAll(result.pagination.next_key);
		}

		for (let i = 0; i < result.dataList.length; i++) {
			totalItemList[index++] = result.dataList[i];
		}

		expect(totalItemList.length).to.be.equal(total);
	});


	it('Contract getContractLogAll', async () => {

		const contractLogList = await firma.Contract.getContractLogAll();
		expect(contractLogList.dataList.length).to.be.equal(contractLogList.dataList.length);
		expect(contractLogList.dataList.length).to.be.greaterThan(0);
	});

	it('Contract getContractLog', async () => {

		const logId = "0";
		const contractLog = await firma.Contract.getContractLog(logId);
		expect(contractLog.id).to.be.equal(logId);
	});


	it('Contract getContractFileAll-pagination', async () => {

		let result = await firma.Contract.getContractFileAll();
		const total = result.pagination.total;
		const totalItemList: ContractFileType[] = [];
		let index = 0;

		while (result.pagination.next_key != null) {
			for (let i = 0; i < result.dataList.length; i++) {
				totalItemList[index++] = result.dataList[i];
			}
			result = await firma.Contract.getContractFileAll(result.pagination.next_key);
		}

		for (let i = 0; i < result.dataList.length; i++) {
			totalItemList[index++] = result.dataList[i];
		}

		expect(totalItemList.length).to.be.equal(total);
	});


	it('Contract getContractFileAll', async () => {

		const contractFileList = await firma.Contract.getContractFileAll();
		expect(contractFileList.dataList.length).to.be.equal(contractFileList.dataList.length);
		expect(contractFileList.dataList.length).to.be.greaterThan(0);
	});

	// contractFileHash value is required.
	it('Contract getContractFile', async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp;

		const ownerAddress = aliceAddress;
		const ownerList = [ownerAddress, ownerAddress];
		const jsonString = "{}";

		const result = await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, ownerList, jsonString);
		expect(result.code).equal(0);

		const contractFile = await firma.Contract.getContractFile(fileHash);
		expect(contractFile.fileHash).to.be.equal(fileHash);
	});

	it('Contract getContractListFromHash', async () => {

		const contractHash = "0xsalkdjfasldkjf2";
		const idList = await firma.Contract.getContractListFromHash(contractHash);
		expect(idList.length).to.be.greaterThan(0);
	});

	// This test can only run with a meaningful contractFileHash, owner1, owner2 value
	it('Contract isContractOwner', async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp;

		const ownerList = [aliceAddress, bobAddress];
		const jsonString = "{}";

		const result = await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, ownerList, jsonString);
		expect(result.code).equal(0);

		let isOwner = await firma.Contract.isContractOwner(fileHash, aliceAddress);
		expect(isOwner).to.be.equal(true);

		isOwner = await firma.Contract.isContractOwner(fileHash, bobAddress);
		expect(isOwner).to.be.equal(true);
	});

	it('Contract getFileHash', async () => {

		const fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");
		expect(fileHash).to.be.equal("61faa15f52f19fc4c4e32e1f1208bf8d6d8134ac0a4b15bcfe05bc420e1aedb0");
	});
});