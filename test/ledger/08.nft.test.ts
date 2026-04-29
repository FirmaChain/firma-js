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

		const tokenURI = 'https://firmachain.org/ledger-test';

		const gas = await firma.Nft.getGasEstimationMint(ledgerWallet, tokenURI);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Nft.mint(ledgerWallet, tokenURI, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('NFT Transfer via Ledger', async function() {
		this.timeout(180000);

		const tokenURI = 'https://firmachain.org/ledger-transfer';

		const mintGas = await firma.Nft.getGasEstimationMint(ledgerWallet, tokenURI);
		const mintFee = Math.ceil(mintGas * 0.1);
		console.log('[Ledger] mint gas:', mintGas, 'fee:', mintFee);

		const mintResult = await firma.Nft.mint(ledgerWallet, tokenURI, { gas: mintGas, fee: mintFee });
		expect(mintResult.code).to.equal(0);
		const nftIds = extractAllNftIds(mintResult.events);

		const transferGas = await firma.Nft.getGasEstimationTransfer(ledgerWallet, bobAddress, nftIds[0]);
		const transferFee = Math.ceil(transferGas * 0.1);
		console.log('[Ledger] transfer gas:', transferGas, 'fee:', transferFee);

		const transferResult = await firma.Nft.transfer(ledgerWallet, bobAddress, nftIds[0], { gas: transferGas, fee: transferFee });

		console.log('[Ledger] transfer code:', transferResult.code);
		expect(transferResult.code).to.equal(0);
	});

	it('NFT Burn via Ledger', async function() {
		this.timeout(180000);

		const tokenURI = 'https://firmachain.org/ledger-burn';

		const mintGas = await firma.Nft.getGasEstimationMint(ledgerWallet, tokenURI);
		const mintFee = Math.ceil(mintGas * 0.1);
		console.log('[Ledger] mint gas:', mintGas, 'fee:', mintFee);

		const mintResult = await firma.Nft.mint(ledgerWallet, tokenURI, { gas: mintGas, fee: mintFee });
		expect(mintResult.code).to.equal(0);
		const nftIds = extractAllNftIds(mintResult.events);

		const burnGas = await firma.Nft.getGasEstimationBurn(ledgerWallet, nftIds[0]);
		const burnFee = Math.ceil(burnGas * 0.1);
		console.log('[Ledger] burn gas:', burnGas, 'fee:', burnFee);

		const burnResult = await firma.Nft.burn(ledgerWallet, nftIds[0], { gas: burnGas, fee: burnFee });

		console.log('[Ledger] burn code:', burnResult.code);
		expect(burnResult.code).to.equal(0);
	});
});
