import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { Expires } from "../sdk/FirmaCosmWasmCw20";
import { FirmaUtil } from "../sdk/FirmaUtil";

import fs from "fs";
import { AccessConfig, AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

describe('[30. cw20 tx Test]', () => {

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

	it.skip('CosmWasm Cw20 StoreCode', async () => {
		const wasmFile = fs.readFileSync("./test/sample/cw20_base.wasm");
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


	it.skip('CosmWasm Cw20 InstantiateContract', async () => {
		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			decimals: 6,
			name: "MyToken",
			symbol: "MTK",
			initial_balances: [
				{
					address: aliceAddress,
					amount: "1000000"
				}
			],
			// mint is optional
			mint: {
				minter: aliceAddress,
				cap: "10000000"
			},
			// marketing is optional
			marketing: {
				description: "MyToken's description is like this.",
				logo: {
					"url": "https://example.com/mytoken-logo.png"
				},
				marketing: aliceAddress,
				project: "https://mytokenproject.com"
			}
		});

		var result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);

		contractAddress = data[0]["events"][0]["attributes"][0]["value"];

		expect(result.code).to.be.equal(0);
	});


	it.skip('Cw20 transfer', async () => {

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const amount = "10000";
		const gas = await firma.Cw20.getGasEstimationTransfer(aliceWallet, contractAddress, bobAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.transfer(aliceWallet, contractAddress, bobAddress, amount, { gas, fee })

		expect(result.code).to.be.equal(0);
	});

	it.skip('Cw20 transfer_form', async () => {

		let aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		let bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const allowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(allowance);

		const amount = "1000";
		const gas = await firma.Cw20.getGasEstimationTransferFrom(bobWallet, contractAddress, aliceAddress, bobAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.transferFrom(bobWallet, contractAddress, aliceAddress, bobAddress, amount, { gas, fee })

		aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const allowance1 = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(allowance1);

		expect(result.code).to.be.equal(0);
	});


	it.skip('Cw20 mint', async () => {

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const minter = await firma.Cw20.getMinter(contractAddress);

		if (minter == null) {
			console.log("minter is null");
			return;
		}

		console.log(minter.minter);
		console.log(minter.cap);

		const info = await firma.Cw20.getTokenInfo(contractAddress)
		console.log(info);

		const amount = "1000";

		const gas = await firma.Cw20.getGasEstimationMint(aliceWallet, contractAddress, aliceAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.mint(aliceWallet, contractAddress, aliceAddress, amount, { gas, fee })

		console.log(result);
		expect(result.code).to.be.equal(0);

	});

	it.skip('Cw20 burn', async () => {

		const info = await firma.Cw20.getTokenInfo(contractAddress)
		console.log(info);

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const amount = "1000";

		const gas = await firma.Cw20.getGasEstimationBurn(aliceWallet, contractAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.burn(aliceWallet, contractAddress, amount, { gas, fee })
		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Cw20 burn_from', async () => {

		const info = await firma.Cw20.getTokenInfo(contractAddress)
		console.log(info);

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const amount = "1000";

		const gas = await firma.Cw20.getGasEstimationBurnFrom(bobWallet, contractAddress, aliceAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.burnFrom(bobWallet, contractAddress, aliceAddress, amount, { gas, fee })
		console.log(result);

		expect(result.code).to.be.equal(0);
	});


	it.skip('Cw20 increase_allowance', async () => {

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const olDAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(olDAllowance);

		const amount = "1000";

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: 1628580000 }; // unix timestamp
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw20.getGasEstimationIncreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.increaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires, { gas, fee })
		console.log(result);

		const newAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(newAllowance);

		//expect(Number.parseInt(olDAllowance) + Number.parseInt(amount)).to.be.equal(Number.parseInt(newAllowance));

	});

	it.skip('Cw20 decrease_allowance', async () => {

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		const bobBalance = await firma.Cw20.getBalance(contractAddress, bobAddress);

		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);
		console.log("bob: " + bobAddress + ", balance: " + bobBalance);

		const olDAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(olDAllowance);

		const amount = "1000";

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: 1628580000 }; // unix timestamp
		//const expires: Expires = { never: {} };

		const expires: Expires = { never: {} };

		const gas = await firma.Cw20.getGasEstimationDecreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.decreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires, { gas, fee })
		console.log(result);

		const newAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		console.log(newAllowance);

		//expect(Number.parseInt(olDAllowance) + Number.parseInt(amount)).to.be.equal(Number.parseInt(newAllowance));

	});

	it.skip('Cw20 update_minter', async () => {

		let minter = await firma.Cw20.getMinter(contractAddress)
		console.log(minter);

		const gas = await firma.Cw20.getGasEstimationUpdateMinter(aliceWallet, contractAddress, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.updateMinter(aliceWallet, contractAddress, bobAddress, { gas, fee })
		console.log(result);

		minter = await firma.Cw20.getMinter(contractAddress)
		console.log(minter);
	});

	it.skip('Cw20 update_marketing', async () => {

		const info = await firma.Cw20.getTokenInfo(contractAddress)
		console.log(info);

		let marketingInfo = await firma.Cw20.getMarketingInfo(contractAddress);
		console.log(marketingInfo);

		const description = "description";
		const marketingAddress = aliceAddress;
		const project = "project";

		const gas = await firma.Cw20.getGasEstimationUpdateMarketing(aliceWallet, contractAddress, description, marketingAddress, project);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.updateMarketing(aliceWallet, contractAddress, description, marketingAddress, project, { gas, fee })
		console.log(result);

		marketingInfo = await firma.Cw20.getMarketingInfo(contractAddress)
		console.log(marketingInfo);
	});

	it.skip('Cw20 update_logo', async () => {

		const minter = await firma.Cw20.getMinter(contractAddress);
		console.log(minter);
		console.log(aliceAddress);

		const info = await firma.Cw20.getTokenInfo(contractAddress)
		console.log(info);

		let marketingInfo = await firma.Cw20.getMarketingInfo(contractAddress);
		console.log(marketingInfo);

		const url = "https://firmachain.org";

		const gas = await firma.Cw20.getGasEstimationUploadLogo(aliceWallet, contractAddress, url);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.uploadLogo(aliceWallet, contractAddress, url, { gas, fee })
		console.log(result);

		marketingInfo = await firma.Cw20.getMarketingInfo(contractAddress)
		console.log(marketingInfo);
	});


	it.skip('Cw20 send', async () => {

		// Basic message that sends a token to a contract and triggers an action on the receiving contract.
		// amount, contract, msg
		// msg should be a base64 encoded json string. (have to check how to trigger it).

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);

		const amount = "10000";

		const targetContractAddress = contractAddress;
		const msg = { action: "send", data: "example" };
		const gas = await firma.Cw20.getGasEstimationSend(aliceWallet, contractAddress, targetContractAddress, amount, msg);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.send(aliceWallet, contractAddress, targetContractAddress, amount, msg, { gas, fee })
		console.log(result);

		//expect(result.code).to.be.equal(0);
	});

	it.skip('Cw20 send_from', async () => {

		// Basic message that sends a token to a contract and triggers an action on the receiving contract.
		// amount, contract, msg
		// msg should be a base64 encoded json string. (have to check how to trigger it).

		const aliceBalance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		console.log("alice: " + aliceAddress + ", balance: " + aliceBalance);

		const amount = "100";

		const targetContractAddress = contractAddress;
		const owner = aliceAddress;
		const msg = { action: "send", data: "example" };
		const gas = await firma.Cw20.getGasEstimationSendFrom(bobWallet, contractAddress, targetContractAddress, owner, amount, msg);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw20.sendFrom(bobWallet, contractAddress, targetContractAddress, owner, amount, msg, { gas, fee })
		console.log(result);

		//expect(result.code).to.be.equal(0);
	});
});