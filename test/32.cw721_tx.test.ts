import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { Expires } from "../sdk/FirmaCosmWasmCw20";
import { FirmaUtil } from "../sdk/FirmaUtil";

import fs from "fs";
import { AccessConfig, AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

describe('[32. cw721 tx Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let contractAddress = "";
	let codeId = "";

	it.skip('CosmWasm Cw721 StoreCode', async () => {
		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		var result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);

		codeId = data[0]["events"][1]["attributes"][1]["value"];

		expect(result.code).to.be.equal(0);
	});


	it.skip('CosmWasm Cw721 InstantiateContract', async () => {
		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			minter: aliceAddress,
			name: "My Awesome NFT Collection",
			symbol: "MAWESOME"			
		});

		var result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);
		
		contractAddress = data[0]["events"][0]["attributes"][0]["value"];
		
		expect(result.code).to.be.equal(0);
	});


	it.skip('Cw721 mint', async () => {

		const owner = aliceAddress;
		const token_id = "4";
		const token_uri = "https://meta.nft.io/uri/" + token_id;

		const gas = await firma.Cw721.getGasEstimationMint(aliceWallet, contractAddress, owner, token_id, token_uri);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, contractAddress, owner, token_id, token_uri, { gas: gas, fee: fee });

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Cw721 burn', async () => {

		const owner = aliceAddress;
		const token_id = "2";

		//const data1 = await firma.Cw721.getAllNftIdList(contractAddress);
		//console.log(data1);

		const gas = await firma.Cw721.getGasEstimationBurn(aliceWallet, contractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.burn(aliceWallet, contractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it.skip('Cw721 transfer', async () => {

		const owner = aliceAddress;
		const token_id = "1";

		const gas = await firma.Cw721.getGasEstimationTransfer(aliceWallet, contractAddress, bobAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.transfer(aliceWallet, contractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw721 transfer', async () => {

		const owner = aliceAddress;
		const token_id = "1";

		const gas = await firma.Cw721.getGasEstimationTransfer(bobWallet, contractAddress, aliceAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.transfer(bobWallet, contractAddress, aliceAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw721 approve', async () => {

		const owner = aliceAddress;
		const token_id = "1";

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: 1628580000 }; // unix timestamp
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw721.getGasEstimationApprove(aliceWallet, contractAddress, bobAddress, token_id, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.approve(aliceWallet, contractAddress, bobAddress, token_id, expires, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw721 revoke', async () => {

		const token_id = "1";

		const gas = await firma.Cw721.getGasEstimationRevoke(aliceWallet, contractAddress, bobAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.revoke(aliceWallet, contractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data.access);
	});

	it.skip('Cw721 approve_all', async () => {

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: 1628580000 }; // unix timestamp
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw721.getGasEstimationApproveAll(aliceWallet, contractAddress, bobAddress, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.approveAll(aliceWallet, contractAddress, bobAddress, expires, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
		
		console.log(aliceAddress)

		const data = await firma.Cw721.getAllOperators(contractAddress, aliceAddress);
		console.log(data);
	});

	it.skip('Cw721 revoke_all', async () => {

		const gas = await firma.Cw721.getGasEstimationRevokeAll(aliceWallet, contractAddress, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.revokeAll(aliceWallet, contractAddress, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getAllOperators(contractAddress, aliceAddress);
		console.log(data);
	});	

	it.skip('Cw721 transfer ownership', async () => {

		const new_owner = bobAddress;

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: 1628580000 }; // unix timestamp
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw721.getGasEstimationUpdateOwnerShipTransfer(aliceWallet, contractAddress, new_owner, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.updateOwnerShipTransfer(aliceWallet, contractAddress, new_owner, expires,{ gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
		
		const data = await firma.Cw721.getOwnerShip(contractAddress);
		console.log(data);
	});

	it.skip	('Cw721 accept ownership', async () => {
		
		const gas = await firma.Cw721.getGasEstimationUpdateOwnerShipAccept(bobWallet, contractAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.updateOwnerShipAccept(bobWallet, contractAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getOwnerShip(contractAddress);
		console.log(data);
	});

	// give up all ownership.
	it.skip('Cw721 renounce ownership', async () => {
		
		const gas = await firma.Cw721.getGasEstimationUpdateOwnerShipRenounce(aliceWallet, contractAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.updateOwnerShipRenounce(aliceWallet, contractAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getOwnerShip(contractAddress);
		console.log(data);
	});

	// TODO: check this test case.
	it.skip('Cw721 send_nft', async () => {

		const token_id = "1";
		const targetContractAddress = contractAddress;

		const gas = await firma.Cw721.getGasEstimationSendNft(aliceWallet, contractAddress, targetContractAddress, bobAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.sendNft(aliceWallet, contractAddress, targetContractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw721 alice mint, approve, bob transfer', async () => {

		const owner = aliceAddress;
		const token_id = "4";
		const token_uri = "https://meta.nft.io/uri/" + token_id;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, contractAddress, owner, token_id, token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, contractAddress, owner, token_id, token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const expires: Expires = { never: {} };

		gas = await firma.Cw721.getGasEstimationApproveAll(aliceWallet, contractAddress, bobAddress, expires);
		fee = Math.ceil(gas * 0.1);

		result = await firma.Cw721.approveAll(aliceWallet, contractAddress, bobAddress, expires, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		gas = await firma.Cw721.getGasEstimationTransfer(bobWallet, contractAddress, bobAddress, token_id);
		fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.transfer(bobWallet, contractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});
});