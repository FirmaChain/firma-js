import fs from 'fs';
import { expect } from 'chai';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[36. Bridge query Test]', () => {

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

	it('cw bridge get_config', async () => {
		const result = await firma.CwBridge.getConfig(bridgeContractAddress);
		expect(result).to.have.property('owner');
		expect(result).to.have.property('cw721_address');
	});

	it('cw bridge get_owner', async () => {
		const result = await firma.CwBridge.getOwner(bridgeContractAddress);
		expect(FirmaUtil.isValidAddress(result)).to.be.equal(true);
	});

	it('cw bridge get_authorized_user', async () => {
		const result = await firma.CwBridge.getAuthorizedUsers(bridgeContractAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge nft_info', async () => {
		const token_id = "15";
		const result = await firma.CwBridge.getNftInfo(bridgeContractAddress, token_id);
		if (result !== null) {
			expect(result).to.have.property('owner');
			expect(result).to.have.property('token_id');
			expect(result).to.have.property('is_deposit');
		}
	});

	it('cw bridge owner_nfts', async () => {
		const result = await firma.CwBridge.getOwnerNfts(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_nfts_info', async () => {
		const result = await firma.CwBridge.getOwnerNftsInfo(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_withdrawable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerWithdrawableNfts(bridgeContractAddress, bobAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge owner_unlockable_nfts', async () => {
		const result = await firma.CwBridge.getOwnerUnlockableNfts(bridgeContractAddress, aliceAddress);
		expect(result).to.be.an('array');
	});

	it('cw bridge global_tx_counts', async () => {
		const result = await firma.CwBridge.getGlobalTxCounts(bridgeContractAddress);
		
		expect(result).to.have.property('lock_count');
		expect(result).to.have.property('unlock_count');
		expect(result).to.have.property('deposit_count');
		expect(result).to.have.property('withdraw_count');
	});
});