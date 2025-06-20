import { expect } from 'chai';
import fs from 'fs';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { Expires } from '../sdk/FirmaCosmWasmCw20';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { FirmaSDK } from '../sdk/FirmaSDK'
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[30. cw20 tx Test]', () => {

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

	it('CosmWasm Cw20 StoreCode', async () => {
		const wasmFile = fs.readFileSync("./test/sample/cw20_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		const result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: gas, fee: fee });
		codeId = extractValue(result.events, "store_code", "code_id");
		expect(result.code).to.be.equal(0);
	});

	it('CosmWasm Cw20 InstantiateContract', async () => {
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

		const result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		contractAddress = extractValue(result.events, "instantiate", "_contract_address");

		expect(result.code).to.be.equal(0);
	});

	it('Cw20 transfer', async () => {

		const amount = "10000";
		const gas = await firma.Cw20.getGasEstimationTransfer(aliceWallet, contractAddress, bobAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.transfer(aliceWallet, contractAddress, bobAddress, amount, { gas, fee })

		expect(result.code).to.be.equal(0);
	});

	it('Cw20 mint', async () => {

		const minter = await firma.Cw20.getMinter(contractAddress);
		if (minter == null) {
			console.log("minter is null");
			return;
		}

		const amount = "1000";
		const gas = await firma.Cw20.getGasEstimationMint(aliceWallet, contractAddress, aliceAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.mint(aliceWallet, contractAddress, aliceAddress, amount, { gas, fee })
		expect(result.code).to.be.equal(0);
	});

	it('Cw20 burn', async () => {

		const amount = "1000";
		const gas = await firma.Cw20.getGasEstimationBurn(aliceWallet, contractAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.burn(aliceWallet, contractAddress, amount, { gas, fee })
		expect(result.code).to.be.equal(0);
	});

	it('Cw20 increase_allowance', async () => {

		const olDAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);

		
		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: "1852937600000000000" }; // unix timestamp nano seconds
		//const expires: Expires = { never: {} };
		const expires: Expires = { never: {} };
		const amount = "1000";

		const gas = await firma.Cw20.getGasEstimationIncreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.increaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires, { gas, fee })
		expect(result.code).to.be.equal(0);

		// Compare allowance
		const newAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		expect(Number.parseInt(olDAllowance.allowance) + Number.parseInt(amount)).to.be.equal(Number.parseInt(newAllowance.allowance));
	});

	it('Cw20 transfer_from', async () => {

		const amount = "1000";
		const gas = await firma.Cw20.getGasEstimationTransferFrom(bobWallet, contractAddress, aliceAddress, bobAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.transferFrom(bobWallet, contractAddress, aliceAddress, bobAddress, amount, { gas, fee })
		expect(result.code).to.be.equal(0);
	});

	it('Cw20 burn_from', async () => {

		const amount = "1000";
		const gas = await firma.Cw20.getGasEstimationBurnFrom(bobWallet, contractAddress, aliceAddress, amount);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.burnFrom(bobWallet, contractAddress, aliceAddress, amount, { gas, fee })
		expect(result.code).to.be.equal(0);
	});

	it('Cw20 decrease_allowance', async () => {

		const olDAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);

		//const expires: Expires = { at_height: 7216240 };
		//const expires: Expires = { at_time: "1852937600000000000" }; // unix timestamp nano seconds
		//const expires: Expires = { never: {} };
		const expires: Expires = { never: {} };
		const amount = "1000";

		const gas = await firma.Cw20.getGasEstimationDecreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.decreaseAllowance(aliceWallet, contractAddress, bobAddress, amount, expires, { gas, fee })
		expect(result.code).to.be.equal(0);

		const newAllowance = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		expect(Number.parseInt(olDAllowance.allowance) + Number.parseInt(amount)).to.be.equal(Number.parseInt(newAllowance.allowance));
	});

	it('Cw20 update_minter', async () => {

		const oldMinter = await firma.Cw20.getMinter(contractAddress)
		console.log(oldMinter);

		const gas = await firma.Cw20.getGasEstimationUpdateMinter(aliceWallet, contractAddress, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.updateMinter(aliceWallet, contractAddress, bobAddress, { gas, fee })
		expect(result.code).to.be.equal(0);console.log(result);

		const newMinter = await firma.Cw20.getMinter(contractAddress);
		expect(oldMinter).to.not.equal(newMinter);
	});

	it('Cw20 update_marketing', async () => {

		const oldMarketingInfo = await firma.Cw20.getMarketingInfo(contractAddress);

		const description = "description";
		const marketingAddress = aliceAddress;
		const project = "project";
		const gas = await firma.Cw20.getGasEstimationUpdateMarketing(aliceWallet, contractAddress, description, marketingAddress, project);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.updateMarketing(aliceWallet, contractAddress, description, marketingAddress, project, { gas, fee })
		expect(result.code).to.be.equal(0);

		const newMarketingInfo = await firma.Cw20.getMarketingInfo(contractAddress)
		expect(oldMarketingInfo).to.not.equal(newMarketingInfo);
	});

	it('Cw20 update_logo', async () => {

		const oldMarketingInfo = await firma.Cw20.getMarketingInfo(contractAddress);

		const url = "https://firmachain.org";
		const gas = await firma.Cw20.getGasEstimationUploadLogo(aliceWallet, contractAddress, url);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.uploadLogo(aliceWallet, contractAddress, url, { gas, fee })
		expect(result.code).to.be.equal(0);

		const newMarketingInfo = await firma.Cw20.getMarketingInfo(contractAddress)
		expect(oldMarketingInfo).to.not.equal(newMarketingInfo);
	});

	it.skip('Cw20 send', async () => {

		// Basic message that sends a token to a contract and triggers an action on the receiving contract.
		// amount, contract, msg
		// msg should be a base64 encoded json string. (have to check how to trigger it).
		const amount = "10000";

		const targetContractAddress = contractAddress;
		const msg = { action: "send", data: "example" };
		const gas = await firma.Cw20.getGasEstimationSend(aliceWallet, contractAddress, targetContractAddress, amount, msg);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.send(aliceWallet, contractAddress, targetContractAddress, amount, msg, { gas, fee })
		expect(result.code).to.be.equal(0);
	});

	it.skip('Cw20 send_from', async () => {

		// Basic message that sends a token to a contract and triggers an action on the receiving contract.
		// amount, contract, msg
		// msg should be a base64 encoded json string. (have to check how to trigger it).
		const amount = "100";

		const targetContractAddress = contractAddress;
		const owner = aliceAddress;
		const msg = { action: "send", data: "example" };
		const gas = await firma.Cw20.getGasEstimationSendFrom(bobWallet, contractAddress, targetContractAddress, owner, amount, msg);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw20.sendFrom(bobWallet, contractAddress, targetContractAddress, owner, amount, msg, { gas, fee })
		expect(result.code).to.be.equal(0);
	});
});