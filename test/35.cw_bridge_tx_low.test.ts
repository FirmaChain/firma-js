import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import fs from "fs";

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { FirmaUtil } from "../sdk/FirmaUtil";
import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";

describe('[35. Bridge tx low Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	let cw721ContractAddress = "";
	let bridgeContractAddress = "";
	
	const tokenId: string = "21";
	const tokenIds: string[] = ["30", "40"];

	const tokenUri = "https://meta.nft.io/uri";

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	// init for low level test
	//----------------------------------------------------------------------
	
	it('Cw721 instantiate', async () => {

		if (cw721ContractAddress !== "") {
			console.log('already cw721ContractAddress');
			return ;
		}

		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const storeCodeGas = 3000000;
		const storeCodeFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeCodeGas, fee: storeCodeFee });
		const storeCodeData = JSON.parse(storeCodeResult.rawLog!);

		const codeId = storeCodeData[0]["events"][1]["attributes"][1]["value"];

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			minter: aliceAddress,
			name: "My Awesome NFT Collection",
			symbol: "MAWESOME"			
		});

		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: instantiateGas, fee: instantiateFee });
		const instantiateData = JSON.parse(instantiateResult.rawLog!);
		
		cw721ContractAddress = instantiateData[0]["events"][0]["attributes"][0]["value"];

		expect(instantiateResult.code).to.be.equal(0);
	});

	it('Cw bridge instantiate', async () => {

		if (bridgeContractAddress !== "") {
			console.log('already bridgeContractAddress');
			return ;
		}

		const wasmFile = fs.readFileSync("./test/sample/bridge_contract.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		const storeCodeData = JSON.parse(storeCodeResult.rawLog!);

		const codeId = storeCodeData[0]["events"][1]["attributes"][1]["value"];

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const noFunds: any = [];

		const testData = JSON.stringify({
			owner: admin,
			cw721_address: cw721ContractAddress
		});

		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		const instantiateData = JSON.parse(instantiateResult.rawLog!);

		bridgeContractAddress = instantiateData[0]["events"][0]["attributes"][0]["value"];

		expect(instantiateResult.code).to.be.equal(0);
	});

	// low level test
	//----------------------------------------------------------------------

	it('[low] Cw721 mint token id', async () => {

		const allNftList = await firma.Cw721.getAllNftIdList(cw721ContractAddress);

		if (!allNftList.includes(tokenId)) {
			await firma.Cw721.mint(aliceWallet, cw721ContractAddress, aliceAddress, tokenId, `${tokenUri}/${tokenId}`);
		} else {
			console.log(`[low] already mint token id ${tokenId}`);
		}
	});

	it('[low] Cw721 send_nft & lock', async () => {

		const targetContractAddress = bridgeContractAddress;

		const msg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const gas = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, targetContractAddress, tokenId, msg);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, targetContractAddress, tokenId, msg, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('[low] cw bridge unlock', async () => {

		const noFunds: any = [];

		const msgData = JSON.stringify({
			"unlock": {
				token_id: tokenId,
			}
		});

		const gas = await firma.CosmWasm.getGasEstimationExecuteContract(aliceWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		var result =  await firma.CosmWasm.executeContract(aliceWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('[low] Cw721 send_nft & deposit', async () => {

		// add authorization
		const gas = await firma.CwBridge.getGasEstimationAddAuthorizedUser(aliceWallet, bridgeContractAddress, aliceAddress);
		const fee = Math.ceil(gas * 0.1);

		const authorizationResult = await firma.CwBridge.addAuthorizedUser(aliceWallet, bridgeContractAddress, aliceAddress, { gas: gas, fee: fee });
		expect(authorizationResult.code).to.be.equal(0);

		const owner = aliceAddress;
		const new_token_uri = "https://meta.nft.io/uri/" + tokenId;

		const allNftList = await firma.Cw721.getAllNftIdList(cw721ContractAddress);
		if (!allNftList.includes(tokenId)) {
			const gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, tokenId, new_token_uri);
			const fee = Math.ceil(gas * 0.1);
	
			const result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, tokenId, new_token_uri, { gas: gas, fee: fee });
			expect(result.code).to.be.equal(0);
		}

		const targetContractAddress = bridgeContractAddress;

		const msg = {
			action: "deposit",
			target_addr: bobAddress
		}

		let gas1 = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, targetContractAddress, tokenId, msg);
		let fee1 = Math.ceil(gas1 * 0.1);

		var result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, targetContractAddress, tokenId, msg, { gas: gas1, fee: fee1 });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('[low] cw bridge withdraw', async () => {

		const noFunds: any = [];

		const msgData = JSON.stringify({
			"withdraw": {
				token_id: tokenId,
			}
		});

		const gas = await firma.CosmWasm.getGasEstimationExecuteContract(bobWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		const result =  await firma.CosmWasm.executeContract(bobWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('[low] cw721 send_nft & bridge lock bulk(msg) & bridge unlock bulk', async () => {

		const allNftList = await firma.Cw721.getAllNftIdList(cw721ContractAddress);
		for (let i = 0; i < tokenIds.length; i++) {
			if (!allNftList.includes(tokenIds[i])) {
				console.log(`new minting nft id by ${tokenIds[i]}`);
				await firma.Cw721.mint(aliceWallet, cw721ContractAddress, aliceAddress, tokenIds[i], `${tokenUri}/${tokenIds[i]}`);
			}
		}

		const contractLockMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const bulkLockList = [];
		for (let i = 0; i < tokenIds.length; i++) {
			const nftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenIds[i]);
			if (nftData.access.owner !== aliceAddress) continue;

			const unsignedMsg = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, tokenIds[i], contractLockMsg);
			bulkLockList.push(unsignedMsg);
		}

		if (bulkLockList.length > 0) {
			const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, bulkLockList);
			const fee = Math.ceil(gas * 0.1);

			const result = await firma.Cw721.signAndBroadcast(aliceWallet, bulkLockList, { gas: gas, fee: fee });
			expect(result.code).to.be.equal(0);
		} else {
			console.log("The cw721 send_nft & bridge lock bulk test has not been conducted.");
		}

		const bulkUnlockList = [];
		for (let i = 0; i < tokenIds.length; i++) {
			const nftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenIds[i]);
			if (nftData.access.owner !== bridgeContractAddress) continue;

			const unsignedMsg = await firma.CwBridge.getUnsignedTxUnlock(aliceWallet, bridgeContractAddress, tokenIds[i]);
			bulkUnlockList.push(unsignedMsg);
		}

		if (bulkUnlockList.length > 0) {
			const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, bulkUnlockList);
			const fee = Math.ceil(gas * 0.1);

			const result = await firma.Cw721.signAndBroadcast(aliceWallet, bulkUnlockList, { gas: gas, fee: fee });
			expect(result.code).to.be.equal(0);
		}
	});

	it('[low] cw721 send_nft & bridge deposit bulk', async () => {

		const contractMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataDeposit(aliceAddress);
		
		const txList = [];
		for (let i = 0; i < tokenIds.length; i++) {
			const unsignedMsg = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, tokenIds[i], contractMsg);
			txList.push(unsignedMsg);
		}
		
		if (txList.length > 0) {
			const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, txList);
			const fee = Math.ceil(gas * 0.1);

			const result = await firma.Cw721.signAndBroadcast(aliceWallet, txList, { gas: gas, fee: fee });
			expect(result.code).to.be.equal(0);
		} else {
			console.log("The cw721 send_nft & bridge deposit bulk test has not been conducted.");
		}
	});
});