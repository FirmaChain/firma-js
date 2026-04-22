/**
 * Ledger CosmWasm Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/03.cosmwasm.test.ts -r ts-node/register --timeout 1200000
 */

import fs from 'fs';
import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { Coin } from '@cosmjs/proto-signing';
import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { AccessConfig, AccessType } from '../../sdk/FirmaCosmWasmService';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[03. Ledger CosmWasm Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

	let codeId = '';
	let contractAddress = '';

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
		return '';
	};

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('CosmWasm StoreCode via Ledger', async function() {
		this.timeout(180000);

		const wasmFile = fs.readFileSync('./test/sample/cw_nameservice.wasm');
		const array = new Uint8Array(wasmFile.buffer);
		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: '', addresses: [] };

		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.CosmWasm.storeCode(ledgerWallet, array, everyBodyAccessConfig, { gas, fee });
		codeId = extractValue(result.events, 'store_code', 'code_id');

		console.log('[Ledger] codeId:', codeId, 'result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('CosmWasm InstantiateContract via Ledger', async function() {
		this.timeout(120000);

		const admin = ledgerAddress;
		const label = 'ledger-instantiate';
		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const funds: Coin[] = [];
		const testData = JSON.stringify({
			purchase_price: { amount: '100', denom: 'ufct' },
			transfer_price: { amount: '999', denom: 'ufct' }
		});

		const result = await firma.CosmWasm.instantiateContract(ledgerWallet, admin, codeId, label, testData, funds, { gas, fee });
		contractAddress = extractValue(result.events, 'instantiate', '_contract_address');

		console.log('[Ledger] contractAddress:', contractAddress, 'result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('CosmWasm ExecuteContract via Ledger', async function() {
		this.timeout(120000);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const testData = JSON.stringify({ register: { name: 'ledger-fred' } });
		const amountFCT = 0.01;
		const funds = [{ denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) }];

		const result = await firma.CosmWasm.executeContract(ledgerWallet, contractAddress, testData, funds, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('CosmWasm UpdateAdmin via Ledger', async function() {
		this.timeout(120000);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const result = await firma.CosmWasm.updateAdmin(ledgerWallet, contractAddress, bobAddress, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	// NOTE: admin is now bobAddress; Ledger wallet no longer has authority.
	it.skip('CosmWasm ClearAdmin via Ledger', async function() {
		this.timeout(120000);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);

		const result = await firma.CosmWasm.clearAdmin(ledgerWallet, contractAddress, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	// NOTE: requires a migratable contract and matching codeId; enable manually.
	it.skip('CosmWasm MigrateContract via Ledger', async function() {
		this.timeout(120000);

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const testData = JSON.stringify({
			purchase_price: { amount: '1000', denom: 'ufct' },
			transfer_price: { amount: '9990', denom: 'ufct' }
		});

		const result = await firma.CosmWasm.migrateContract(ledgerWallet, contractAddress, codeId, testData, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
