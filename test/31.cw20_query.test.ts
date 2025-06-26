import { expect } from 'chai';
import fs from 'fs';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';

describe('[31. cw20 query Test]', () => {

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

	it('Cw20 setup query ', async () => {
		const wasmFile = fs.readFileSync("./test/sample/cw20_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const storeCodeGas = 3000000;
		const storeCodeFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};

		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeCodeGas, fee: storeCodeFee });
		const codeId = extractValue(storeCodeResult.events, "store_code", "code_id");
		expect(storeCodeResult.code).to.be.equal(0);

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
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

		const result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: instantiateGas, fee: instantiateFee });
		contractAddress = extractValue(result.events, "instantiate", "_contract_address");

		expect(result.code).to.be.equal(0);
	});

	it('Cw20 getBalance', async () => {

		const balance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		expect(balance).to.be.a('string');
		expect(Number(balance)).to.be.at.least(0);
	});

	it('Cw20 getBalance - no balance', async () => {

		const nobalance_address = "firma1d84pmnumnsh80v74lta0vnpd476ncp4pjnuklr";
		const balance = await firma.Cw20.getBalance(contractAddress, nobalance_address);
		expect(balance).to.be.a('string');
		expect(Number(balance)).to.equal(0);
	});

	it('Cw20 getTotalSupply', async () => {

		const totalSupply = await firma.Cw20.getTotalSupply(contractAddress);
		expect(totalSupply).to.be.a('string');
		expect(Number(totalSupply)).to.be.at.least(0);
	});

	it('Cw20 getTokenInfo', async () => {

		const tokenInfo = await firma.Cw20.getTokenInfo(contractAddress);
		expect(tokenInfo).to.be.an('object');
		expect(tokenInfo).to.have.property('name');
		expect(tokenInfo).to.have.property('symbol');
		expect(tokenInfo).to.have.property('decimals');
		expect(tokenInfo).to.have.property('total_supply');
	});

	it('Cw20 getMinter', async () => {

		const minter = await firma.Cw20.getMinter(contractAddress);
		expect(minter).to.be.an('object');
		expect(minter).to.have.property('minter');
	});

	it('Cw20 getAllowance', async () => {

		const info = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		expect(info).to.be.an('object');
		expect(info).to.have.property('allowance');
		expect(info).to.have.property('expires');
	});

	it('Cw20 getAllAllowances', async () => {

		const info = await firma.Cw20.getAllAllowances(contractAddress, aliceAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getAllSpenderAllowances', async () => {
		const info = await firma.Cw20.getAllSpenderAllowances(contractAddress, bobAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getAllAccounts', async () => {

		const info = await firma.Cw20.getAllAccounts(contractAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getMarketingInfo', async () => {

		const info = await firma.Cw20.getMarketingInfo(contractAddress);
		expect(info).to.be.an('object');
	});

	it.skip('Cw20 getDownloadLogo', async () => {

		// INFO: Errors if no logo data is stored for this contract.
		try {
			const info = await firma.Cw20.getDownloadLogo(contractAddress);
		} catch (error) {
			expect(false).to.not.equal(true);
			console.log(error);
		}
	});
});