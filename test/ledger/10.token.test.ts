/**
 * Ledger Token Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/10.token.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[10. Ledger Token Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

	const timeStamp = Math.round(+new Date() / 1000);
	const symbol = 'LEDGER' + timeStamp;
	const tokenID = 'uledger' + timeStamp;
	const tokenName = 'Ledger Test Token ' + timeStamp;
	const tokenURI = 'https://firmachain.org';
	const totalSupply = 10000000;
	const decimal = 6;
	const mintable = true;
	const burnable = true;

	before(async function() {
		this.timeout(30000);

		firma = new FirmaSDK(TestChainConfig);

		const cosmosLedgerWallet = new FirmaCosmosLedgerWallet(TransportNodeHID);
		ledgerWallet = await firma.Wallet.initFromLedger(cosmosLedgerWallet);
		ledgerAddress = await ledgerWallet.getAddress();

		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		console.log('[Ledger] address:', ledgerAddress);
		console.log('[Ledger] tokenID:', tokenID);
	});

	it('Token CreateToken via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.Token.createToken(ledgerWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Token Mint via Ledger', async function() {
		this.timeout(120000);

		const amount = 100000;
		const result = await firma.Token.mint(ledgerWallet, tokenID, amount, decimal, ledgerAddress);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Token Burn via Ledger', async function() {
		this.timeout(120000);

		const amount = 10;
		const result = await firma.Token.burn(ledgerWallet, tokenID, amount, decimal);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Token UpdateTokenURI via Ledger', async function() {
		this.timeout(120000);

		const newUri = 'https://firmachain.dev';
		const result = await firma.Token.updateTokenURI(ledgerWallet, tokenID, newUri);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('bank sendToken via Ledger', async function() {
		this.timeout(120000);

		const amount = 100;
		const result = await firma.Bank.sendToken(ledgerWallet, bobAddress, tokenID, amount, decimal);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
