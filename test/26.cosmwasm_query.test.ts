import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[26. cosmwasm query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	let contractAddress = "";

	it('CosmWasm getCodeList', async () => {

		// Codes gets the metadata for all stored wasm codes
		let result = await firma.CosmWasm.getCodeList();

		//console.log(result[0].code_id);
		//console.log(result[0].creator);
		//console.log(result[0].data_hash);
	});

	it('CosmWasm getCodeData', async () => {

		const codeId = "1";

		// Code gets the binary code and metadata for a singe wasm code
		let result = await firma.CosmWasm.getCodeData(codeId);

		//console.log(result.code_info.code_id);
		//console.log(result.code_info.creator);
		//console.log(result.code_info.data_hash);

		//binary data but output data is from string
		//console.log(result.data);
	});

	it('CosmWasm getCodeData', async () => {

		const codeId = "1";

		let result = await firma.CosmWasm.getCodeData(codeId);

		//console.log(result.code_info.code_id);
		//console.log(result.code_info.creator);
		//console.log(result.code_info.data_hash);

		// binary data
		//console.log(result.data);
	});

	it('CosmWasm getContractListFromCodeId', async () => {

		const codeId = "1";

		let result = await firma.CosmWasm.getContractListFromCodeId(codeId);
		contractAddress = result[0];
		//console.log(result[0]);
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