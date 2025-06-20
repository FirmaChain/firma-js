import fs from 'fs';
import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { Coin } from '@cosmjs/proto-signing';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

describe('[25. CosmWasm Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	const extractValue = (events: readonly any[], eventType: string, attrKey: string) => {
		for (const event of events) {
			if (event.type === eventType) {
				for (const attr of event.attributes) {
					if (attr.key === attrKey) {
						return attr.value;
					}
				}
			}
		}
		return "";
	};

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	// sample : cw_nameservice.wasm
	// https://docs.cosmwasm.com/docs/1.0/getting-started/compile-contract

	let codeId = "";
	let contractAddress = "";

	it('CosmWasm StoreCode', async () => {

		const wasmFile = fs.readFileSync("./test/sample/cw_nameservice.wasm");
		const array = new Uint8Array(wasmFile.buffer);
		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "", addresses: [] };
		// const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		const result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		codeId = extractValue(result.events, "store_code", "code_id");
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm InstantiateContract', async () => {

		const admin = aliceAddress;
		const label = "test1";
		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const funds: Coin[] = [];
		const testData = JSON.stringify({ "purchase_price": { "amount": "100", "denom": "ufct" }, "transfer_price": { "amount": "999", "denom": "ufct" } });

		const result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, funds, { gas: gas, fee: fee });
		contractAddress = extractValue(result.events, "instantiate", "_contract_address");
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm ExecuteContract', async () => {

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const testData = JSON.stringify({ "register": { "name": "fred" } });
		const amountFCT = 0.01;
		const funds = [{ denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) }];

		const result = await firma.CosmWasm.executeContract(aliceWallet, contractAddress, testData, funds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm UpdateAdmin', async () => {

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const result = await firma.CosmWasm.updateAdmin(aliceWallet, contractAddress, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm ClearAdmin', async () => {

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const result = await firma.CosmWasm.clearAdmin(aliceWallet, contractAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	// This test requires specific conditions, so it is skipped by default
	it.skip('CosmWasm MigrateContract', async () => {

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const testData = JSON.stringify({ "purchase_price": { "amount": "1000", "denom": "ufct" }, "transfer_price": { "amount": "9990", "denom": "ufct" } });

		const result = await firma.CosmWasm.migrateContract(aliceWallet, contractAddress, codeId, testData, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});
});