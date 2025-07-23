import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[26. cosmwasm query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	let contractAddress = "";
	let codeId = "";

	it('CosmWasm getCodeList', async () => {

		// Codes gets the metadata for all stored wasm codes
		const result = await firma.CosmWasm.getCodeList();
		expect(result.length).to.be.greaterThan(0);

		codeId = result[0].code_id;

		const codeInfo = result[0];
		expect(codeInfo).to.have.property('code_id');
		expect(codeInfo).to.have.property('creator');
		expect(codeInfo).to.have.property('data_hash');
	});

	it('CosmWasm getCodeData', async () => {

		// Code gets the binary code and metadata for a singe wasm code
		const result = await firma.CosmWasm.getCodeData(codeId);

		expect(result).to.not.be.null;
		expect(result).to.have.property('code_info');
		expect(result).to.have.property('data');
		
		const codeInfo = result.code_info;
		expect(codeInfo).to.have.property('code_id', codeId);
		expect(codeInfo).to.have.property('creator');
		expect(codeInfo).to.have.property('data_hash');

		expect(result.data).to.be.a('string');
	});

	it('CosmWasm getContractListFromCodeId', async () => {

		const result = await firma.CosmWasm.getContractListFromCodeId(codeId);
		
		expect(result).to.not.be.null;
		expect(result).to.have.property('dataList');
		expect(result).to.have.property('pagination');
		
		expect(result.dataList).to.be.an('array');
		expect(result.dataList.length).to.be.greaterThan(0);
		expect(result.dataList[0]).to.be.a('string');
		
		expect(result.pagination).to.have.property('next_key');
		expect(result.pagination).to.have.property('total');

		contractAddress = result.dataList[0];
	});

	it('CosmWasm getPinnedCodeList', async () => {

		// PinnedCodes gets the pinned code ids
		// TODO: check how to pin code.
		const codeList = await firma.CosmWasm.getPinnedCodeList();
		expect(codeList).to.be.an('array');
	});

	// ContractInfo gets the contract meta data
	it('CosmWasm getContractInfo', async () => {

		const result = await firma.CosmWasm.getContractInfo(contractAddress);
		
		expect(result).to.not.be.null;
		expect(result).to.have.property('address', contractAddress);
		expect(result).to.have.property('contract_info');

		const contractInfo = result.contract_info;
		expect(contractInfo).to.have.property('code_id');
		expect(contractInfo).to.have.property('creator');
		expect(contractInfo).to.have.property('admin');
		expect(contractInfo).to.have.property('label');
		expect(contractInfo).to.have.property('created');
		expect(contractInfo).to.have.property('ibc_port_id');
		expect(contractInfo).to.have.property('extension');
		
		expect(contractInfo.created).to.have.property('block_height');
		expect(contractInfo.created).to.have.property('tx_index');
	});

	it('CosmWasm getContractHistory', async () => {
		const result = await firma.CosmWasm.getContractHistory(contractAddress);
		expect(result).to.be.an('array');
		expect(result.length).to.be.greaterThan(0);

		const history = result[0];
		expect(history.code_id).to.be.equal(codeId);
	});

	// AllContractState gets all raw store data for a single contract
	it('CosmWasm getContractState', async () => {

		const result = await firma.CosmWasm.getContractState(contractAddress);

		expect(result).to.be.an('array');
		expect(result.length).to.be.greaterThan(0);

		const model = result[0];
		expect(model).to.have.property('key');
		expect(model).to.have.property('value');
	});

	it('CosmWasm getContractRawQueryData', async () => {

		try {
			const stateResult = await firma.CosmWasm.getContractState(contractAddress);
			if (!stateResult || stateResult.length === 0) {
				return;
			}

			const firstKey = stateResult[0].key;
			
			const result = await firma.CosmWasm.getContractRawQueryData(contractAddress, firstKey);
			
			expect(result).to.be.a('string');
			expect(result.length).to.be.greaterThan(0);
			expect(result).to.match(/^[0-9A-Fa-f]*$/);
		} catch (error: any) {
		}
	});

	it('CosmWasm getContractSmartQueryData', async () => {

		const queries = [
			'{"config":{}}',
		];
		
		let successfulQuery: string | null = null;
		let result: string | null = null;
		
		for (const query of queries) {
			try {
				result = await firma.CosmWasm.getContractSmartQueryData(contractAddress, query);
				successfulQuery = query;
				break;
			} catch (error: any) {
				continue;
			}
		}
		
		expect(successfulQuery).to.not.be.null;
		expect(result).to.not.be.null;
		
		if (result) {
			expect(result).to.be.a('string');
			expect(result.length).to.be.greaterThan(0);
			
			const parsedResult = JSON.parse(result);
			expect(parsedResult).to.be.an('object');
			
			if (successfulQuery === '{"token_info":{}}') {
				expect(parsedResult).to.have.property('name');
				expect(parsedResult).to.have.property('symbol');
				expect(parsedResult).to.have.property('decimals');
				expect(parsedResult).to.have.property('total_supply');
			}
		}
	});
});