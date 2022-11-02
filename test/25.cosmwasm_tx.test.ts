import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

import fs from "fs";
import { Coin } from '@cosmjs/proto-signing';
import { AccessConfig, AccessType } from 'cosmjs-types/cosmwasm/wasm/v1/types';

describe('[25. CosmWasm Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	// sample : cw_nameservice.wasm
	// https://docs.cosmwasm.com/docs/1.0/getting-started/compile-contract

	let codeId = "";
	let contractAddress = "";

	it('CosmWasm StoreCode', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let aliceAddress = await aliceWallet.getAddress();

		const wasmFile = fs.readFileSync("./test/sample/cw_nameservice.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		var result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);

		codeId = data[0]["events"][1]["attributes"][1]["value"];

		//console.log(codeId);
		//console.log(result);
		expect(result.code).to.be.equal(0);
	});


	it('CosmWasm InstantiateContract', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const funds: Coin[] = [];

		const testData = JSON.stringify({ "purchase_price": { "amount": "100", "denom": "ufct" }, "transfer_price": { "amount": "999", "denom": "ufct" } });
		var result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, funds, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);
		
		contractAddress = data[0]["events"][0]["attributes"][0]["value"];
		
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm ExecuteContract', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const testData = JSON.stringify({ "register": { "name": "fred" } });

		const amountFCT = 0.01;
		const funds = [{ denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) }];

		var result = await firma.CosmWasm.executeContract(aliceWallet, contractAddress, testData, funds, { gas: gas, fee: fee });

		//console.log(result);
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm UpdateAdmin', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		let bobAddress = await bobWallet.getAddress();

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		var result = await firma.CosmWasm.updateAdmin(aliceWallet, contractAddress, bobAddress, { gas: gas, fee: fee });

		//console.log(result);
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm ClearAdmin', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		var result = await firma.CosmWasm.clearAdmin(aliceWallet, contractAddress, { gas: gas, fee: fee });

		//console.log(result);
		expect(result.code).to.be.equal(0);
	});

	it.skip('CosmWasm MigrateContract', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const testData = JSON.stringify({ "purchase_price": { "amount": "1000", "denom": "ufct" }, "transfer_price": { "amount": "9990", "denom": "ufct" } });

		var result = await firma.CosmWasm.migrateContract(aliceWallet, contractAddress, codeId, testData, { gas: gas, fee: fee });

		//console.log(result);
		expect(result.code).to.be.equal(0);
	});
});