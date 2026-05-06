/**
 * Ledger IBC Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/07.ibc.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { TestChainConfig } from '../config_test';

// skipped by default: requires an active IBC channel on the target chain.
describe.skip('[07. Ledger IBC Tx Test]', () => {

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

	it('IBC transfer via Ledger', async function() {
		this.timeout(180000);

		const sourcePort = 'transfer';
		const sourceChannel = 'channel-1';
		const denom = 'ufct';
		const amount = '10';
		const receiver = 'firma1320eclh4dwzx89qjap2q5n2hna07zs2vm8tzlu';

		const clientState = await firma.Ibc.getClientState(sourceChannel, sourcePort);
		const revisionHeight = clientState.identified_client_state.client_state.latest_height.revision_height;
		const revisionNumber = clientState.identified_client_state.client_state.latest_height.revision_number;

		const height: Height = Height.fromPartial({
			revisionHeight: BigInt(revisionHeight) + BigInt(1000),
			revisionNumber: BigInt(revisionNumber)
		});

		const timeoutTimestamp = BigInt((Date.now() + 600000).toString() + '000000');
		const memo = '';

		const gas = await firma.Ibc.getGasEstimationTransfer(ledgerWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimestamp, memo);
		const fee = Math.ceil(gas * 0.1);

		console.log('[Ledger] gas:', gas, 'fee:', fee);
		console.log('[Ledger] Please confirm the transaction on your Ledger device...');

		const result = await firma.Ibc.transfer(ledgerWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimestamp, memo, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
