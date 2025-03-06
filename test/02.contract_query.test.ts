import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil"
import { ContractFileType, ContractLogType } from '../sdk/firmachain/contract';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[02. Contract Query Test]', () => {

	let firma: FirmaSDK;
	let timeStamp = Math.round(+new Date() / 1000);
	let fileHash = "0xklsdjflaksjflaksjf" + timeStamp;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Pre-execution for testing for contract file hash', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
		
		const eventName = "CreateContract";
		const logJsonString = "{}";
		await firma.Contract.addContractLog(aliceWallet, fileHash, timeStamp, eventName, aliceAddress, logJsonString);
		await firma.Contract.addContractLog(bobWallet, fileHash, timeStamp, eventName, bobAddress, logJsonString);

		const ownerList = [aliceAddress, bobAddress];
		const fileJsonString = "{\"fileHash\": \"" + fileHash + "\"" + "}";
		await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, ownerList, fileJsonString);
	});

	it('Contract getContractLogAll-pagination', async () => {

		let result = await firma.Contract.getContractLogAll();

		const total = result.pagination.total;

		let totalItemList: ContractLogType[] = [];
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

		let totalItemList: ContractFileType[] = [];
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

		//  for(let i = 0; i < contractFileList.length; i++){
		//  	console.log(contractFileList[i]);
		//  }
		//console.log("contractFileList:" + contractFileList.length);

		expect(contractFileList.dataList.length).to.be.equal(contractFileList.dataList.length);
		expect(contractFileList.dataList.length).to.be.greaterThan(0);

	});

	it('Contract getContractFile', async () => {

		const contractFile = await firma.Contract.getContractFile(fileHash);
		expect(contractFile.fileHash).to.be.equal(fileHash);
	});

	it('Contract getContractListFromHash', async () => {

		const idList = await firma.Contract.getContractListFromHash(fileHash);

		for (let i = 0; i < idList.length; i++) {
			const data = await firma.Contract.getContractLog(idList[i]);
			//console.log(data);
		}

		expect(idList.length).to.be.greaterThan(0);
	});

	it('Contract isContractOwner', async () => {

		let isOwner = await firma.Contract.isContractOwner(fileHash, aliceAddress);
		expect(isOwner).to.be.equal(true);

		isOwner = await firma.Contract.isContractOwner(fileHash, bobAddress);
		expect(isOwner).to.be.equal(true);
	});

	it('Contract getFileHash', async () => {

		let fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");
		expect(fileHash).to.be.equal("61faa15f52f19fc4c4e32e1f1208bf8d6d8134ac0a4b15bcfe05bc420e1aedb0");
	});
});