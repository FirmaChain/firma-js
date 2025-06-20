import { FirmaSDK } from '../sdk/FirmaSDK';
import { TestChainConfig } from './config_test';

describe('[26. cosmwasm query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	let contractAddress = "";

	it('CosmWasm getCodeList', async () => {

		// Codes gets the metadata for all stored wasm codes
		const result = await firma.CosmWasm.getCodeList();
	});

	it('CosmWasm getCodeData', async () => {

		const codeId = "1";

		// Code gets the binary code and metadata for a singe wasm code
		const result = await firma.CosmWasm.getCodeData(codeId);
	});

	it('CosmWasm getContractListFromCodeId', async () => {

		const codeId = "132";
		const result = await firma.CosmWasm.getContractListFromCodeId(codeId);
	});

	it('CosmWasm getPinnedCodeList', async () => {

		// PinnedCodes gets the pinned code ids
		// TODO: check how to pin code.
		const codeList = await firma.CosmWasm.getPinnedCodeList();
	});

	// ContractInfo gets the contract meta data
	it('CosmWasm getContractInfo', async () => {

		const result = await firma.CosmWasm.getContractInfo(contractAddress);
	});

	it('CosmWasm getContractHistory', async () => {

		const result = await firma.CosmWasm.getContractHistory(contractAddress);
	});

	// AllContractState gets all raw store data for a single contract
	it('CosmWasm getContractState', async () => {

		const result = await firma.CosmWasm.getContractState(contractAddress);
	});

	it('CosmWasm getContractRawQueryData', async () => {

		const hexString = '0006636F6E666967';
		const result = await firma.CosmWasm.getContractRawQueryData(contractAddress, hexString);
	});

	it('CosmWasm getContractSmartQueryData', async () => {

		const query = '{"resolve_record": { "name": "fred" }}';
		const result = await firma.CosmWasm.getContractSmartQueryData(contractAddress, query);
	});
});