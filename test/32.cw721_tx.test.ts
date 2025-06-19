import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from "./config_test";
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { Expires } from "../sdk/FirmaCosmWasmCw20";
import { FirmaUtil } from "../sdk/FirmaUtil";

import fs from "fs";
import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";

describe('[32. cw721 tx Test]', () => {

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

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let contractAddress = "";
	let codeId = "";

	it('CosmWasm Cw721 StoreCode', async () => {
		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		var result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		codeId = extractValue(result.events, "store_code", "code_id");

		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm Cw721 InstantiateContract', async () => {
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
		contractAddress = extractValue(result.events, "instantiate", "_contract_address");
		
		expect(result.code).to.be.equal(0);
	});

	it('Cw721 mint', async () => {

		const owner = aliceAddress;
		const token_id = "15";
		const token_uri = "https://meta.nft.io/uri/" + token_id;

		const gas = await firma.Cw721.getGasEstimationMint(aliceWallet, contractAddress, owner, token_id, token_uri);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, contractAddress, owner, token_id, token_uri, { gas: gas, fee: fee });

		const nftData = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(nftData);

		expect(result.code).to.be.equal(0);
	});

	it('Cw721 burn', async () => {

		const owner = aliceAddress;
		const token_id = "10";

		//const data1 = await firma.Cw721.getAllNftIdList(contractAddress);
		//console.log(data1);

		const gas = await firma.Cw721.getGasEstimationBurn(aliceWallet, contractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.burn(aliceWallet, contractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw721 transfer', async () => {

		const owner = aliceAddress;
		const token_id = "10";

		const gas = await firma.Cw721.getGasEstimationTransfer(aliceWallet, contractAddress, bobAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.transfer(aliceWallet, contractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it('Cw721 transfer', async () => {

		const owner = aliceAddress;
		const token_id = "10";

		const gas = await firma.Cw721.getGasEstimationTransfer(bobWallet, contractAddress, aliceAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.transfer(bobWallet, contractAddress, aliceAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it('Cw721 approve', async () => {

		const owner = aliceAddress;
		const token_id = "11";

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: "1852937600000000000" }; // unix timestamp nano seconds
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw721.getGasEstimationApprove(aliceWallet, contractAddress, bobAddress, token_id, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.approve(aliceWallet, contractAddress, bobAddress, token_id, expires, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data);
	});

	it('Cw721 revoke', async () => {

		const token_id = "1";

		const gas = await firma.Cw721.getGasEstimationRevoke(aliceWallet, contractAddress, bobAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.revoke(aliceWallet, contractAddress, bobAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(contractAddress, token_id);
		console.log(data.access);
	});

	it('Cw721 approve_all', async () => {

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Cw721Expires = { at_time: "1852937600000000000" }; // unix timestamp nano seconds
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

	it('Cw721 revoke_all', async () => {

		const gas = await firma.Cw721.getGasEstimationRevokeAll(aliceWallet, contractAddress, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.revokeAll(aliceWallet, contractAddress, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getAllOperators(contractAddress, aliceAddress);
		console.log(data);
	});	

	it('Cw721 transfer ownership', async () => {

		const new_owner = bobAddress;

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Cw721Expires = { at_time: "1852937600000000000" }; // unix timestamp nano seconds
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw721.getGasEstimationUpdateOwnerShipTransfer(aliceWallet, contractAddress, new_owner, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.updateOwnerShipTransfer(aliceWallet, contractAddress, new_owner, expires,{ gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
		
		const data = await firma.Cw721.getOwnerShip(contractAddress);
		console.log(data);
	});

	it('Cw721 accept ownership', async () => {
		
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

	it('Cw721 alice mint, approve, bob transfer', async () => {

		const owner = aliceAddress;
		const token_id = "16";
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