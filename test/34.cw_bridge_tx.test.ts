import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";

import fs from "fs";
import { FirmaUtil } from "../sdk/FirmaUtil";
import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";

describe('[34. Bridge tx Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	let cw721ContractAddress = "";
	let bridgeContractAddress = "";

	const tokenId: string = "21";
	const tokenIds: string[] = ["30", "40"];

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	it('Cw721 instantiate && mint Nft ID', async () => {

		if (cw721ContractAddress === "") {
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
		}
	});

	it('Cw bridge instantiate', async () => {

		if (bridgeContractAddress === "") {
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
		}
	});

	it('Cw bridge chage_owner', async () => {
		
		const new_owner = bobAddress;

		const gas = await firma.CwBridge.getGasEstimationChangeOwner(aliceWallet, bridgeContractAddress, new_owner);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.changeOwner(aliceWallet, bridgeContractAddress, new_owner, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.CwBridge.getOwner(bridgeContractAddress);
		console.log(data);
	});

	it('Cw bridge add_authorized_user', async () => {

		const user = aliceAddress;

		const gas = await firma.CwBridge.getGasEstimationAddAuthorizedUser(bobWallet, bridgeContractAddress, user);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.addAuthorizedUser(bobWallet, bridgeContractAddress, user, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		console.log(data);
	});

	it('Cw bridge lock', async () => {

		// minting nft id
		const owner = aliceAddress;
		const new_token_uri = "https://meta.nft.io/uri/" + tokenId;

		const mintGas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, tokenId, new_token_uri);
		const mintFee = Math.ceil(mintGas * 0.1);

		await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, tokenId, new_token_uri, { gas: mintGas, fee: mintFee });

		const gas = await firma.CwBridge.getGasEstimationLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenId);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.lock(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenId, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('cw bridge lock bulk', async () => {

		const owner = aliceAddress;
		const tokenUri = "https://meta.nft.io/uri";

		try {
			const allNftList = await firma.Cw721.getAllNftIdList(cw721ContractAddress);
	
			// bulk minting
			const bulkMintList = [];
			for (let i = 0; i < tokenIds.length; i++) {
				if (allNftList.includes(tokenIds[i])) continue;

				const unsignedMsg = await firma.Cw721.getUnsignedTxMint(aliceWallet, cw721ContractAddress, owner, tokenIds[i], `${tokenUri}/${tokenIds[i]}`);
				bulkMintList.push(unsignedMsg);
			}
	
			if (bulkMintList.length > 0) {
				const bulkMintGas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, bulkMintList);
				const bulkMintFee = Math.ceil(bulkMintGas * 0.1);

				await firma.Cw721.signAndBroadcast(aliceWallet, bulkMintList, {gas: bulkMintGas, fee: bulkMintFee });
			}

			// lock bulk
			const bulkLockList = [];
	
			for (let i = 0; i < tokenIds.length; i++) {
				const cw721NftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenIds[i]);
				if (cw721NftData.access.owner === bridgeContractAddress) continue;

				const unsignedMsg = await firma.CwBridge.getUnsignedTxLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenIds[i]);
				bulkLockList.push(unsignedMsg);
			}
	
			if (bulkLockList.length > 0) {
				const bulkLockGas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, bulkLockList);
				const bulkLockFee = Math.ceil(bulkLockGas * 0.1);
		
				const result = await firma.CwBridge.signAndBroadcast(aliceWallet, bulkLockList, { gas: bulkLockGas, fee: bulkLockFee });
				expect(result.code).to.be.equal(0);
			} else {
				console.log("The lock bulk test has not been conducted.");
			}
		} catch (error) {
			expect(1).to.be.equal(0);

			console.log(error);
		}
	});

	it('Cw bridge unlock', async () => {

		const gas = await firma.CwBridge.getGasEstimationUnlock(aliceWallet, bridgeContractAddress, tokenId);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.unlock(aliceWallet, bridgeContractAddress, tokenId, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('Cw bridge unlock bulk', async () => {

		try {
			const bulkUnlockList = [];
	
			for (let i = 0; i < tokenIds.length; i++) {
				const cw721NftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenIds[i]);
				if (cw721NftData.access.owner !== bridgeContractAddress) continue;
	
				const unsignedMsg = await firma.CwBridge.getUnsignedTxUnlock(aliceWallet, bridgeContractAddress, tokenIds[i]);
				bulkUnlockList.push(unsignedMsg);
			}
	
			if (bulkUnlockList.length > 0) {
				const bulkUnlockGas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, bulkUnlockList);
				const bulkUnlockFee = Math.ceil(bulkUnlockGas * 0.1);
	
				const result = await firma.CwBridge.signAndBroadcast(aliceWallet, bulkUnlockList, { gas: bulkUnlockGas, fee: bulkUnlockFee });
				expect(result.code).to.be.equal(0);
			} else {
				console.log("The unlock bulk test has not been conducted.");
			}
		} catch (error) {
			expect(1).to.be.equal(0);
			
			console.log(error);
		}
	});

	it('Cw bridge deposit', async () => {
		
		const nftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(nftData);

		const gas = await firma.CwBridge.getGasEstimationDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenId, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.deposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenId, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge deposit bulk', async () => {

		try {
			const bulkDepositList = [];
	
			for (let i = 0; i < tokenIds.length; i++) {
				const nftData = await firma.Cw721.getNftData(cw721ContractAddress, tokenIds[i]);
				if (nftData.access.owner !== aliceAddress) continue;
	
				const unsignedMsg = await firma.CwBridge.getUnsignedTxDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, tokenIds[i], bobAddress);
				bulkDepositList.push(unsignedMsg);
			}
	
			if (bulkDepositList.length > 0) {
				const bulkUnlockGas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, bulkDepositList);
				const bulkUnlockFee = Math.ceil(bulkUnlockGas * 0.1);
	
				const result = await firma.CwBridge.signAndBroadcast(aliceWallet, bulkDepositList, { gas: bulkUnlockGas, fee: bulkUnlockFee });
				expect(result.code).to.be.equal(0);
			} else {
				console.log("The deposit bulk test has not been conducted.");
			}
		} catch (error) {
			expect(1).to.be.equal(0);
			
			console.log(error);
		}
	});

	it('Cw bridge withdraw', async () => {

		const gas = await firma.CwBridge.getGasEstimationWithdraw(bobWallet, bridgeContractAddress, tokenId);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.withdraw(bobWallet, bridgeContractAddress, tokenId, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, tokenId);
		console.log(data);
	});

	it('Cw bridge withdraw bulk', async () => {

		const bulkWithdrawLisk = [];

		for (let i = 0; i < tokenIds.length; i++) {
			const unsignedMsg = await firma.CwBridge.getUnsignedTxWithdraw(bobWallet, bridgeContractAddress, tokenIds[i]);
			bulkWithdrawLisk.push(unsignedMsg);
		}

		if (bulkWithdrawLisk.length > 0) {
			const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(bobWallet, bulkWithdrawLisk);
			const fee = Math.ceil(gas * 0.1);
			
			const result = await firma.CwBridge.signAndBroadcast(bobWallet, bulkWithdrawLisk, { gas: gas, fee: fee });
			expect(result.code).to.be.equal(0);
		}
	});

	it('Cw bridge remove_authorized_user', async () => {

		const user = aliceAddress;

		const gas = await firma.CwBridge.getGasEstimationRemoveAuthorizedUser(bobWallet, bridgeContractAddress, user);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.removeAuthorizedUser(bobWallet, bridgeContractAddress, user, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		console.log(data);
	});
});