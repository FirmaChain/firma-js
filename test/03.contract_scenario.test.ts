import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[03. Contract scenario base test]', () => {

	const donueMnemonic = aliceMnemonic;
	const creatorMnemonic = bobMnemonic;
	const signer1Mnemonic = "couch tonight jelly pond notice spring gold tornado cancel hover hill soft table can buyer already region bean mask cart gasp include change rent";
	const signer2Mnemonic = "frozen never essence submit moon night cement omit final guilt border draft caution zoo gorilla illegal notable whisper try name orange hollow maximum arrive";
	const signer3Mnemonic = "stock vapor planet van asthma upgrade scheme fuel cushion before brief knee kick lesson gun spatial protect danger they stem stay chunk critic cram";
	const signer4Mnemonic = "tomorrow hospital bottom lucky insane play concert casual truly certain antique airport safe envelope relax matter cute zone boring calm pudding eyebrow mouse spawn";

	const firma = new FirmaSDK(TestChainConfig);
	const contractHash = "0xtestcontract" + Math.round(+new Date() / 1000);

	it('CreateContract add', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const creatorWallet = await firma.Wallet.fromMnemonic(creatorMnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CreateContract";
		let ownerAddress = await creatorWallet.getAddress();
		let jsonString = "{\"totalOwner\":4}";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		expect(result.code).equal(0);
	});

	it('AddSigner - each tx add', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "AddSigner";
		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();
		let jsonString = "";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress1, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress2, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress3, jsonString);
		expect(result.code).equal(0);

		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress4, jsonString);
		expect(result.code).equal(0);

	});

	it('AddSigner - all tx to one sign', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "AddSigner";
		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();
		let jsonString = "";

		var msg1 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress1, jsonString);
		var msg2 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress2, jsonString);
		var msg3 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress3, jsonString);
		var msg4 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress4, jsonString);

		let result = await firma.Contract.signAndBroadcast(donueWallet, [msg1, msg2, msg3, msg4]);
		expect(result.code).equal(0);
	});

	it('SignContract - all tx to one sign', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "SignContract";
		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();
		let jsonString = "";

		var msg1 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress1, jsonString);
		var msg2 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress2, jsonString);
		var msg3 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress3, jsonString);
		var msg4 = await firma.Contract.getUnsignedTxAddContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress4, jsonString);

		let result = await firma.Contract.signAndBroadcast(donueWallet, [msg1, msg2, msg3, msg4]);
		expect(result.code).equal(0);
	});

	it('SignContract - each tx add', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "SignContract";
		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();
		let jsonString = "";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress1, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress2, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress3, jsonString);
		expect(result.code).equal(0);

		timeStamp = Math.round(+new Date() / 1000);;
		result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress4, jsonString);
		expect(result.code).equal(0);
	});

	it('RejectContract - one user reject', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "RejectContract";
		let ownerAddress1 = await signer1Wallet.getAddress();
		let jsonString = "";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, ownerAddress1, jsonString);
		expect(result.code).equal(0);

	});

	it('DestroyContract - after reject, destroy contract', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const creatorWallet = await firma.Wallet.fromMnemonic(creatorMnemonic);
		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "DestroyContract";
		let creatorAddress = await creatorWallet.getAddress();
		let ownerAddress1 = await signer1Wallet.getAddress(); // reject user
		let jsonString = "{\"Notes\": \"" + "Reject Contract by " + ownerAddress1 + "\"" + "}";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, creatorAddress, jsonString);
		expect(result.code).equal(0);

	});

	it('CompleteContract - all user complte sign and make fileHash, write to chain', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);
		const creatorWallet = await firma.Wallet.fromMnemonic(creatorMnemonic);

		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CompleteContract";
		let creatorAddress = await creatorWallet.getAddress();

		let fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");
		let jsonString = "{\"fileHash\": \"" + fileHash + "\"" + "}";

		var result = await firma.Contract.addContractLog(donueWallet, contractHash, timeStamp, eventName, creatorAddress, jsonString);
		expect(result.code).equal(0);

	});

	it('CryptoJS.AES.encrypt Test - after CompleteContract, encrypt fileHash by signer private key', async () => {

		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let ipfsFileHash = "Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD";

		let encryptHash = signer1Wallet.encryptData(ipfsFileHash);
		let decryptHash = signer1Wallet.decryptData(encryptHash);

		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signer2Wallet.encryptData(ipfsFileHash);
		decryptHash = signer2Wallet.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signer3Wallet.encryptData(ipfsFileHash);
		decryptHash = signer3Wallet.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);

		encryptHash = signer4Wallet.encryptData(ipfsFileHash);
		decryptHash = signer4Wallet.decryptData(encryptHash);
		expect(ipfsFileHash).equal(decryptHash);

	});

	it('createContractFile - CompleteContract, after private sign, write to chain by new message', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);

		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();

		let timeStamp = Math.round(+new Date() / 1000);;
		let fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf") + timeStamp;

		//console.log("fileHash : " + fileHash);

		let ipfsHash = await firma.Ipfs.addJson(fileHash);

		let encryptHash1 = signer1Wallet.encryptData(ipfsHash);
		let encryptHash2 = signer2Wallet.encryptData(ipfsHash);
		let encryptHash3 = signer3Wallet.encryptData(ipfsHash);
		let encryptHash4 = signer4Wallet.encryptData(ipfsHash);

		var jsonData = {
			"storage": "ipfs",
			"encryptIpfsHash": [encryptHash1, encryptHash2, encryptHash3, encryptHash4]
		}

		let jsonString = JSON.stringify(jsonData);

		var result = await firma.Contract.createContractFile(donueWallet, fileHash, timeStamp, [ownerAddress1, ownerAddress2, ownerAddress3, ownerAddress4], jsonString);
		expect(result.code).equal(0);

		var contractFile = await firma.Contract.getContractFile(fileHash);
		expect(contractFile.fileHash).equal(fileHash);

		let metaData = JSON.parse(contractFile.metaDataJsonString);

		let decryptHash1 = signer1Wallet.decryptData(metaData.encryptIpfsHash[0]);
		expect(decryptHash1).equal(ipfsHash);
		let decryptHash2 = signer2Wallet.decryptData(metaData.encryptIpfsHash[1]);
		expect(decryptHash2).equal(ipfsHash);
		let decryptHash3 = signer3Wallet.decryptData(metaData.encryptIpfsHash[2]);
		expect(decryptHash3).equal(ipfsHash);
		let decryptHash4 = signer4Wallet.decryptData(metaData.encryptIpfsHash[3]);
		expect(decryptHash4).equal(ipfsHash);

		//console.log("contract file url:" + firma.Ipfs.getURLFromHash(decryptHash1));
	});

	it('createContractFile - CompleteContract, after private sign, write to chain by new message. error scenario (duplicate)', async () => {

		const donueWallet = await firma.Wallet.fromMnemonic(donueMnemonic);

		const signer1Wallet = await firma.Wallet.fromMnemonic(signer1Mnemonic);
		const signer2Wallet = await firma.Wallet.fromMnemonic(signer2Mnemonic);
		const signer3Wallet = await firma.Wallet.fromMnemonic(signer3Mnemonic);
		const signer4Wallet = await firma.Wallet.fromMnemonic(signer4Mnemonic);

		let ownerAddress1 = await signer1Wallet.getAddress();
		let ownerAddress2 = await signer2Wallet.getAddress();
		let ownerAddress3 = await signer3Wallet.getAddress();
		let ownerAddress4 = await signer4Wallet.getAddress();

		let timeStamp = Math.round(+new Date() / 1000);;
		let fileHash = await FirmaUtil.getFileHash("./test/sample/sample_contract.pdf");

		let ipfsFileHash = "Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD";
		let encryptHash1 = signer1Wallet.encryptData(ipfsFileHash);
		let encryptHash2 = signer2Wallet.encryptData(ipfsFileHash);
		let encryptHash3 = signer3Wallet.encryptData(ipfsFileHash);
		let encryptHash4 = signer4Wallet.encryptData(ipfsFileHash);

		var jsonData = {
			"storage": "ipfs",
			"encryptIpfsHash": [encryptHash1, encryptHash2, encryptHash3, encryptHash4]
		}

		let jsonString = JSON.stringify(jsonData);

		try {
			var result = await firma.Contract.createContractFile(donueWallet, fileHash, timeStamp, [ownerAddress1, ownerAddress2, ownerAddress3, ownerAddress4], jsonString);
			expect(result.code).not.equals(0);

			var contractFile = await firma.Contract.getContractFile(fileHash);
			expect(contractFile.fileHash).equal(fileHash);
		}
		catch (e) {

		}
	});
});