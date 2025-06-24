import fs from 'fs';
import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';
import { FirmaUtil } from '../sdk/FirmaUtil';

describe('[35. Bridge tx low Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

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

	let cw721ContractAddress = "";
	let bridgeContractAddress = "";

	// low level test
	//----------------------------------------------------------------------

	it('[low] Cw721 contract setup', async () => {

		// Cw721 store code
		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const storeGas = 3000000;
		const storeFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};

		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeGas, fee: storeFee });
		const codeId = extractValue(storeCodeResult.events, "store_code", "code_id");
		expect(storeCodeResult.code).to.be.equal(0);

		// Cw721 instantiate
		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			minter: aliceAddress,
			name: "My Awesome NFT Collection",
			symbol: "MAWESOME"			
		});

		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: instantiateGas, fee: instantiateFee });
		cw721ContractAddress = extractValue(instantiateResult.events, "instantiate", "_contract_address");
		expect(instantiateResult.code).to.be.equal(0);
	});

	it('[low] Cw bridge contract setup', async () => {

		// Cw bridge store code
		const wasmFile = fs.readFileSync("./test/sample/bridge_contract.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const storeCodeGas = 3000000;
		const storeCodeFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeCodeGas, fee: storeCodeFee });
		const codeId = extractValue(storeCodeResult.events, "store_code", "code_id");
		expect(storeCodeResult.code).to.be.equal(0);

		// Cw bridge instantiate
		const admin = aliceAddress;
		const label = "CwBridge";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			owner: admin,
			cw721_address: cw721ContractAddress
		});

		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: instantiateGas, fee: instantiateFee });
		bridgeContractAddress = extractValue(instantiateResult.events, "instantiate", "_contract_address");
		expect(instantiateResult.code).to.be.equal(0);
	});

	it('[low] Cw721 prepare nfts (mint bulk)', async () => {
		const tokenIds = ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"];

		let txList = [];
		for (const tokenId of tokenIds) {
			const txData = await firma.Cw721.getUnsignedTxMint(aliceWallet, cw721ContractAddress, aliceAddress, tokenId, `https://meta.nft.io/uri/${tokenId}`);
			txList.push(txData);
		}

		const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, txList);
		const fee = Math.ceil(gas * 0.1);

		const txResult = await firma.Cw721.signAndBroadcast(aliceWallet, txList, { gas, fee });
		expect(txResult.code).to.be.equal(0);
	});

	it('[low] Cw721 send_nft & lock', async () => {

		const token_id = "101";

		const msg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const gas = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id, msg);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id, msg, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('[low] cw bridge unlock', async () => {

		const token_id = "101";
		const noFunds: any = [];

		const msgData = JSON.stringify({
			"unlock": {
				token_id,
			}
		});

		const gas = await firma.CosmWasm.getGasEstimationExecuteContract(aliceWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		const result =  await firma.CosmWasm.executeContract(aliceWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('[low] Cw721 send_nft & deposit', async () => {

		const tokenId = "102";

		const msg = {
			action: "deposit",
			target_addr: bobAddress
		}

		const authUsers = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		if (!authUsers.includes(aliceAddress)) {
			await firma.CwBridge.addAuthorizedUser(aliceWallet, bridgeContractAddress, aliceAddress);
		}

		let gas = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, tokenId, msg);
		let fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, tokenId, msg, { gas, fee });
		expect(result.code).to.be.equal(0);
	});

	it('[low] cw bridge withdraw', async () => {

		const token_id = "102";
		const noFunds: any = [];

		const msgData = JSON.stringify({
			"withdraw": {
				token_id,
			}
		});

		const gas = await firma.CosmWasm.getGasEstimationExecuteContract(bobWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		const result =  await firma.CosmWasm.executeContract(bobWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('[low] cw721 send_nft & bridge lock bulk', async () => {

		const token_id1 = "103";
		const token_id2 = "104";

		const contractMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const tx1 = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id1, contractMsg);
		const tx2 = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id2, contractMsg);

		const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw721.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('[low] cw721 send_nft & bridge deposit bulk', async () => {

		const token_id1 = "105";
		const token_id2 = "106";

		const contractMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataDeposit(aliceAddress);

		const tx1 = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id1, contractMsg);
		const tx2 = await firma.Cw721.getUnsignedTxSendNft(aliceWallet, cw721ContractAddress, bridgeContractAddress, token_id2, contractMsg);

		const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Cw721.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});
});