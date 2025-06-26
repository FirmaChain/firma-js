
import fs from 'fs';
import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[34. Bridge tx Test]', () => {

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

	let codeId = "";
	let cw721ContractAddress = "";
	let bridgeContractAddress = "";

	it('Cosmwasm Cw721 setup', async () => {

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
		codeId = extractValue(storeCodeResult.events, "store_code", "code_id");
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

	it('CosmWasm Cw bridge StoreCode', async () => {
		const wasmFile = fs.readFileSync("./test/sample/bridge_contract.wasm");
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

	it('CosmWasm Cw bridge InstantiateContract', async () => {
		const admin = aliceAddress;
		const label = "CwBridge";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			owner: admin,
			cw721_address: cw721ContractAddress
		});

		const result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		bridgeContractAddress = extractValue(result.events, "instantiate", "_contract_address");
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge mint temp', async () => {

		const owner = aliceAddress;
		
		const tokenId1 = "1";
		const tokenUri1 = "https://meta.nft.io/uri/" + tokenId1;
		const gas1 = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, tokenId1, tokenUri1);
		const fee1 = Math.ceil(gas1 * 0.1);
		const result1 = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, tokenId1, tokenUri1, { gas: gas1, fee: fee1 });
		expect(result1.code).to.be.equal(0);
		
		const tokenId2 = "2";
		const tokenUri2 = "https://meta.nft.io/uri/" + tokenId2;
		const gas2 = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, tokenId2, tokenUri2);
		const fee2 = Math.ceil(gas2 * 0.1);
		const result2 = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, tokenId2, tokenUri2, { gas: gas2, fee: fee2 });
		expect(result2.code).to.be.equal(0);
		
		const tokenId3 = "3";
		const tokenUri3 = "https://meta.nft.io/uri/" + tokenId3;
		const gas3 = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, tokenId3, tokenUri3);
		const fee3 = Math.ceil(gas3 * 0.1);
		const result3 = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, tokenId3, tokenUri3, { gas: gas3, fee: fee3 });
		expect(result3.code).to.be.equal(0);
	});

	it('Cw bridge add_authorized_user', async () => {

		const user = aliceAddress;

		const gas = await firma.CwBridge.getGasEstimationAddAuthorizedUser(aliceWallet, bridgeContractAddress, user);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.addAuthorizedUser(aliceWallet, bridgeContractAddress, user, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge lock', async () => {

		const token_id = "1";

		const gas = await firma.CwBridge.getGasEstimationLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.lock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('cw bridge lock bulk', async () => {

		const token_id1 = "2";
		const token_id2 = "3";

		const tx1 = await firma.CwBridge.getUnsignedTxLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge unlock', async () => {

		const token_id = "1";

		const gas = await firma.CwBridge.getGasEstimationUnlock(aliceWallet, bridgeContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.unlock(aliceWallet, bridgeContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge unlock bulk', async () => {

		const token_id1 = "2";
		const token_id2 = "3";

		const tx1 = await firma.CwBridge.getUnsignedTxUnlock(aliceWallet, bridgeContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxUnlock(aliceWallet, bridgeContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge deposit', async () => {
		
		const token_id = "1";

		const gas = await firma.CwBridge.getGasEstimationDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.deposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge deposit bulk', async () => {

		const token_id1 = "2";
		const token_id2 = "3";

		const tx1 = await firma.CwBridge.getUnsignedTxDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id1, bobAddress);
		const tx2 = await firma.CwBridge.getUnsignedTxDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id2, bobAddress);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge withdraw', async () => {

		const token_id = "1";

		const gas = await firma.CwBridge.getGasEstimationWithdraw(bobWallet, bridgeContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.withdraw(bobWallet, bridgeContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge withdraw bulk', async () => {

		const token_id1 = "2";
		const token_id2 = "3";

		const tx1 = await firma.CwBridge.getUnsignedTxWithdraw(bobWallet, bridgeContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxWithdraw(bobWallet, bridgeContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(bobWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.signAndBroadcast(bobWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge remove_authorized_user', async () => {

		const user = aliceAddress;

		const gas = await firma.CwBridge.getGasEstimationRemoveAuthorizedUser(aliceWallet, bridgeContractAddress, user);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.removeAuthorizedUser(aliceWallet, bridgeContractAddress, user, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});

	it('Cw bridge chage_owner', async () => {
		
		const new_owner = bobAddress;

		const gas = await firma.CwBridge.getGasEstimationChangeOwner(aliceWallet, bridgeContractAddress, new_owner);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.CwBridge.changeOwner(aliceWallet, bridgeContractAddress, new_owner, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});
});