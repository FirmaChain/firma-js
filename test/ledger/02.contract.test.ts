/**
 * Ledger Contract Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/02.contract.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { TestChainConfig } from '../config_test';

describe('[02. Ledger Contract Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
	});

	it('Contract createContractFile via Ledger', async function() {
		this.timeout(120000);

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = '0xledger-file-' + timeStamp;
		const ownerList = [ledgerAddress];
		const jsonString = '{}';

		const gas = await firma.Contract.getGasEstimationCreateContractFile(ledgerWallet, fileHash, timeStamp, ownerList, jsonString);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Contract.createContractFile(ledgerWallet, fileHash, timeStamp, ownerList, jsonString, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Contract addContractLog via Ledger', async function() {
		this.timeout(120000);

		const contractHash = '0xledger-contract-hash';
		const timeStamp = Math.round(+new Date() / 1000);
		const eventName = 'CreateContract';
		const ownerAddress = ledgerAddress;
		const jsonString = '{}';

		const gas = await firma.Contract.getGasEstimationAddContractLog(ledgerWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Contract.addContractLog(ledgerWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
