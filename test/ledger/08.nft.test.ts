/**
 * Ledger NFT Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/08.nft.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[08. Ledger NFT Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

	const extractAllNftIds = (events: readonly any[]) => {
		const nftIds: string[] = [];
		for (const event of events) {
			if (event.type === 'message') {
				for (const attr of event.attributes) {
					if (attr.key === 'nftID') {
						nftIds.push(attr.value);
					}
				}
			}
		}
		return nftIds;
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

	it('NFT Mint via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Nft.mint(ledgerWallet, 'https://firmachain.org/ledger-test');

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('NFT Transfer via Ledger', async function() {
		this.timeout(180000);

		const mintResult = await firma.Nft.mint(ledgerWallet, 'https://firmachain.org/ledger-transfer');
		expect(mintResult.code).to.equal(0);
		const nftIds = extractAllNftIds(mintResult.events);

		const transferResult = await firma.Nft.transfer(ledgerWallet, bobAddress, nftIds[0]);

		console.log('[Ledger] transfer code:', transferResult.code);
		expect(transferResult.code).to.equal(0);
	});

	it('NFT Burn via Ledger', async function() {
		this.timeout(180000);

		const mintResult = await firma.Nft.mint(ledgerWallet, 'https://firmachain.org/ledger-burn');
		expect(mintResult.code).to.equal(0);
		const nftIds = extractAllNftIds(mintResult.events);

		const burnResult = await firma.Nft.burn(ledgerWallet, nftIds[0]);

		console.log('[Ledger] burn code:', burnResult.code);
		expect(burnResult.code).to.equal(0);
	});
});
