import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil"
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, signerMnemonic1, signerMnemonic2, signerMnemonic3, signerMnemonic4, TestChainConfig } from './config_test';

describe('[03. Contract scenario base test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;
	let signerWallet1: FirmaWalletService;
	let signerAddress1: string;
	let signerWallet2: FirmaWalletService;
	let signerAddress2: string;
	let signerWallet3: FirmaWalletService;
	let signerAddress3: string;
	let signerWallet4: FirmaWalletService;
	let signerAddress4: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
		signerWallet1 = await firma.Wallet.fromMnemonic(signerMnemonic1);
		signerAddress1 = await signerWallet1.getAddress();
		signerWallet2 = await firma.Wallet.fromMnemonic(signerMnemonic2);
		signerAddress2 = await signerWallet2.getAddress();
		signerWallet3 = await firma.Wallet.fromMnemonic(signerMnemonic3);
		signerAddress3 = await signerWallet3.getAddress();
		signerWallet4 = await firma.Wallet.fromMnemonic(signerMnemonic4);
		signerAddress4 = await signerWallet4.getAddress();
	})

	const contractHash = "0xtestcontract" + Math.round(+new Date() / 1000);	

	it('CreateContract add', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = bobAddress;
		const jsonString = "{\"totalOwner\":4}";

		const result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		expect(result.code).equal(0);
	});

	it('AddSigner - each tx add', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "AddSigner";
		const jsonString = "";

		let result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress1, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress2, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress3, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress4, jsonString);
		expect(result.code).equal(0);

	});

	it('AddSigner - all tx to one sign', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "AddSigner";
		const jsonString = "";

		const msg1 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress1, jsonString);
		const msg2 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress2, jsonString);
		const msg3 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress3, jsonString);
		const msg4 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress4, jsonString);

		const msgArray = [msg1, msg2, msg3, msg4, msg1, msg2, msg3, msg4, msg1];
		const gas = await firma.Contract.getGasEstimationSignAndBroadcast(aliceWallet, msgArray);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Contract.signAndBroadcast(aliceWallet, msgArray, {gas: gas, fee: fee});
		expect(result.code).equal(0);
	});

	it('SignContract - all tx to one sign', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "SignContract";
		const jsonString = "";

		const msg1 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress1, jsonString);
		const msg2 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress2, jsonString);
		const msg3 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress3, jsonString);
		const msg4 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress4, jsonString);

		const result = await firma.Contract.signAndBroadcast(aliceWallet, [msg1, msg2, msg3, msg4]);
		expect(result.code).equal(0);
	});

	it('SignContract - each tx add', async () => {

		let timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "SignContract";
		const jsonString = "";

		let result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress1, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress2, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress3, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress4, jsonString);
		expect(result.code).equal(0);
	});

	it('RejectContract - one user reject', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "RejectContract";
		const jsonString = "";

		const result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, signerAddress1, jsonString);
		expect(result.code).equal(0);
	});

	it('DestroyContract - after reject, destroy contract', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "DestroyContract";
		const jsonString = "{\"Notes\": \"" + "Reject Contract by " + signerAddress1 + "\"" + "}";

		const result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, bobAddress, jsonString);
		expect(result.code).equal(0);
	});

	it('CompleteContract - all user complte sign and make fileHash, write to chain', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CompleteContract";

		const fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");
		const jsonString = "{\"fileHash\": \"" + fileHash + "\"" + "}";

		const result = await firma.Contract.addContractLog(aliceWallet, contractHash, timeStamp, eventName, bobAddress, jsonString);
		expect(result.code).equal(0);
	});

	it('CryptoJS.AES.encrypt Test - after CompleteContract, encrypt fileHash by signer private key', async () => {

		const ipfsFileHash = "Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD";

		let encryptHash = signerWallet1.encryptData(ipfsFileHash);
		let decryptHash = signerWallet1.decryptData(encryptHash);

		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signerWallet2.encryptData(ipfsFileHash);
		decryptHash = signerWallet2.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signerWallet3.encryptData(ipfsFileHash);
		decryptHash = signerWallet3.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signerWallet4.encryptData(ipfsFileHash);
		decryptHash = signerWallet4.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);
	});

	it('createContractFile - CompleteContract, after private sign, write to chain by new message', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf") + timeStamp;

		const ipfsHash = await firma.Ipfs.addJson(fileHash);

		const encryptHash1 = signerWallet1.encryptData(ipfsHash);
		const encryptHash2 = signerWallet2.encryptData(ipfsHash);
		const encryptHash3 = signerWallet3.encryptData(ipfsHash);
		const encryptHash4 = signerWallet4.encryptData(ipfsHash);

		const jsonData = {
			"storage": "ipfs",
			"encryptIpfsHash": [encryptHash1, encryptHash2, encryptHash3, encryptHash4]
		};

		const jsonString = JSON.stringify(jsonData);

		const result = await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, [signerAddress1, signerAddress2, signerAddress3, signerAddress4], jsonString);
		expect(result.code).equal(0);

		const contractFile = await firma.Contract.getContractFile(fileHash);
		expect(contractFile.fileHash).equal(fileHash);

		const metaData = JSON.parse(contractFile.metaDataJsonString);

		const decryptHash1 = signerWallet1.decryptData(metaData.encryptIpfsHash[0]);
		expect(decryptHash1).equal(ipfsHash);
		const decryptHash2 = signerWallet2.decryptData(metaData.encryptIpfsHash[1]);
		expect(decryptHash2).equal(ipfsHash);
		const decryptHash3 = signerWallet3.decryptData(metaData.encryptIpfsHash[2]);
		expect(decryptHash3).equal(ipfsHash);
		const decryptHash4 = signerWallet4.decryptData(metaData.encryptIpfsHash[3]);
		expect(decryptHash4).equal(ipfsHash);
	});

	it('createContractFile - CompleteContract, after private sign, write to chain by new message. error scenario (duplicate)', async () => {

		const timeStamp = Math.round(+new Date() / 1000);;
		const fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");

		const ipfsFileHash = "Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD";
		const encryptHash1 = signerWallet1.encryptData(ipfsFileHash);
		const encryptHash2 = signerWallet2.encryptData(ipfsFileHash);
		const encryptHash3 = signerWallet3.encryptData(ipfsFileHash);
		const encryptHash4 = signerWallet4.encryptData(ipfsFileHash);

		const jsonData = {
			"storage": "ipfs",
			"encryptIpfsHash": [encryptHash1, encryptHash2, encryptHash3, encryptHash4]
		}

		const jsonString = JSON.stringify(jsonData);

		try {
			const result = await firma.Contract.createContractFile(aliceWallet, fileHash, timeStamp, [signerAddress1, signerAddress2, signerAddress3, signerAddress4], jsonString);
			expect(result.code).not.equals(0);

			const contractFile = await firma.Contract.getContractFile(fileHash);
			expect(contractFile.fileHash).equal(fileHash);
		}
		catch (e) {
			expect(true).to.be.equal(false);
		}
	});
});