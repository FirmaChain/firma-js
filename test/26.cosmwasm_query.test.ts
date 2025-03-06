import { expect } from "chai";
import fs from "fs";
import { Coin } from "@cosmjs/proto-signing";

import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil";
import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[26. cosmwasm query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	let codeId = "";
	let contractAddress = "";

	it('Cosmwasm Storecode & Instantiate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		if (codeId === "") {
			const wasmFile = fs.readFileSync("./test/sample/cw_nameservice.wasm");
			const array = new Uint8Array(wasmFile.buffer);
	
			const storeCodeGas = 3000000;
			const storeCodeFee = FirmaUtil.getUFCTFromFCT(0.3);
	
			const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
	
			const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeCodeGas, fee: storeCodeFee });
			const storeCodeData = JSON.parse(storeCodeResult.rawLog!);
	
			codeId = storeCodeData[0]["events"][1]["attributes"][1]["value"];
			expect(storeCodeResult.code).to.be.equal(0);
		}
	
		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
		const funds: Coin[] = [];

		const testData = JSON.stringify({ "purchase_price": { "amount": "100", "denom": "ufct" }, "transfer_price": { "amount": "999", "denom": "ufct" } });
		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, funds, { gas: instantiateGas, fee: instantiateFee });
		const instantiateData = JSON.parse(instantiateResult.rawLog!);
		
		contractAddress = instantiateData[0]["events"][0]["attributes"][0]["value"];
		
		expect(instantiateResult.code).to.be.equal(0);
	});

	it('CosmWasm getCodeList', async () => {

		// Codes gets the metadata for all stored wasm codes
		let result = await firma.CosmWasm.getCodeList();

		//console.log(result[0].code_id);
		//console.log(result[0].creator);
		//console.log(result[0].data_hash);
	});

	it('CosmWasm getCodeData', async () => {

		// Code gets the binary code and metadata for a singe wasm code
		let result = await firma.CosmWasm.getCodeData(codeId);

		//console.log(result.code_info.code_id);
		//console.log(result.code_info.creator);
		//console.log(result.code_info.data_hash);

		//binary data but output data is from string
		//console.log(result.data);
	});

	it('CosmWasm getCodeData', async () => {

		let result = await firma.CosmWasm.getCodeData(codeId);

		//console.log(result.code_info.code_id);
		//console.log(result.code_info.creator);
		//console.log(result.code_info.data_hash);

		// binary data
		//console.log(result.data);
	});

	it('CosmWasm getContractListFromCodeId', async () => {
		
		// add pagination
		let result = await firma.CosmWasm.getContractListFromCodeId(codeId);
		//console.log(result);
		
	});

	it('CosmWasm getPinnedCodeList', async () => {

		// PinnedCodes gets the pinned code ids
		// TODO: check how to pin code.

		let codeList = await firma.CosmWasm.getPinnedCodeList();
		//console.log(codeList);
	});

	// ContractInfo gets the contract meta data
	it('CosmWasm getContractInfo', async () => {

		let result = await firma.CosmWasm.getContractInfo(contractAddress);
		
		//console.log(result.address);
		//console.log(result.contract_info.code_id);
		//console.log(result.contract_info.creator);
		//console.log(result.contract_info.admin);
		//console.log(result.contract_info.label);
		//console.log(result.contract_info.created);
		//console.log(result.contract_info.ibc_port_id);
		//console.log(result.contract_info.extension);		
	});

	it('CosmWasm getContractHistory', async () => {

		let result = await firma.CosmWasm.getContractHistory(contractAddress);

		// console.log(result[0].operation);
		// console.log(result[0].code_id);
		// console.log(result[0].updated);
		// console.log(result[0].msg);
	});

	// AllContractState gets all raw store data for a single contract
	it('CosmWasm getContractState', async () => {

		let result = await firma.CosmWasm.getContractState(contractAddress);

		//console.log(result[0].key);
		//console.log(result[0].value);
	});


	it('CosmWasm getContractRawQueryData', async () => {

		const hexString = '0006636F6E666967';
		let result = await firma.CosmWasm.getContractRawQueryData(contractAddress, hexString);
		//console.log(result);
	});

	it('CosmWasm getContractSmartQueryData', async () => {

		const query = '{"resolve_record": { "name": "fred" }}';

		let result = await firma.CosmWasm.getContractSmartQueryData(contractAddress, query);		
		//console.log(result);
	});
});