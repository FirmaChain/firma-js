import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import fs from "fs";

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { FirmaUtil } from "../sdk/FirmaUtil";
import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";

describe('[36. Bridge query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	let cw721ContractAddress = "";
	let bridgeContractAddress = "";

	const tokenId = "1";

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	// init for query test
	//----------------------------------------------------------------------
	
	it('Cw721 instantiate', async () => {

		if (cw721ContractAddress !== "") {
			console.log('already cw721ContractAddress');
			return ;
		}

		try {
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
		} catch (error) {
			console.log(error);
		}
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

	it('cw bridge get_config', async () => {
		const result = await firma.CwBridge.getConfig(bridgeContractAddress);
		// console.log(result);
	});

	it('cw bridge get_owner', async () => {
		const result = await firma.CwBridge.getOwner(bridgeContractAddress);
		// console.log(result);
	});

	it('cw bridge get_authorized_user', async () => {
		const result = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		// console.log(result);
	});

	it('cw bridge nft_info', async () => {
		// not exist token_id -> return null.
		const result = await firma.CwBridge.getNftInfo(bridgeContractAddress, tokenId);
		// console.log(result);
	});

	it('cw bridge owner_nfts', async () => {
		const result = await firma.CwBridge.getOwnerNfts(bridgeContractAddress, aliceAddress);
		// console.log(result);
	});

	it('cw bridge owner_nfts_info', async () => {
		const result = await firma.CwBridge.getOwnerNftsInfo(bridgeContractAddress, aliceAddress);
		// console.log(result);
	});

	it('cw bridge owner_withdrawable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerWithdrawableNfts(bridgeContractAddress, bobAddress);
		// console.log(result);
	});

	it('cw bridge owner_unlockable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerUnlockableNfts(bridgeContractAddress, aliceAddress);
		// console.log(result);
	});

	it('cw bridge global_tx_counts', async () => {
		const result = await firma.CwBridge.getGlobalTxCounts(bridgeContractAddress);
		// console.log(result);
	});
});