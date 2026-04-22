/**
 * Ledger Feegrant Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/05.feegrant.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';
import { PeriodicAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';

import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaUtil } from '../../sdk/FirmaUtil';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[05. Ledger Feegrant Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

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

	it('GrantBasicAllowance via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.FeeGrant.grantBasicAllowance(
			ledgerWallet,
			bobAddress,
			{
				spendLimit: [{
					denom: firma.Config.denom,
					amount: '10000'
				}]
			}
		);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('RevokeAllowance via Ledger', async function() {
		this.timeout(120000);

		const result = await firma.FeeGrant.revokeAllowance(ledgerWallet, bobAddress);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('GrantBasicAllowance with expiration via Ledger', async function() {
		this.timeout(120000);

		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 1);

		const result = await firma.FeeGrant.grantBasicAllowance(
			ledgerWallet,
			bobAddress,
			{
				spendLimit: [{
					amount: '10000',
					denom: firma.Config.denom
				}],
				expiration: {
					seconds: BigInt(Math.floor(expirationDate.getTime() / 1000)),
					nanos: (expirationDate.getTime() % 1000) * 1000000
				}
			}
		);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);

		const revokeResult = await firma.FeeGrant.revokeAllowance(ledgerWallet, bobAddress);
		expect(revokeResult.code).to.equal(0);
	});

	it('GrantPeriodicAllowance via Ledger', async function() {
		this.timeout(120000);

		try {
			await firma.FeeGrant.revokeAllowance(ledgerWallet, bobAddress);
		} catch (error) {}

		const spendAmount = FirmaUtil.getUFCTStringFromFCTStr('10');
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 20);

		const periodicAllowanceData: PeriodicAllowance = {
			basic: {
				spendLimit: [
					{ amount: spendAmount, denom: firma.Config.denom }
				]
			},
			period: { seconds: BigInt(60 * 60 * 24), nanos: 0 },
			periodSpendLimit: [
				{ amount: spendAmount, denom: firma.Config.denom }
			],
			periodCanSpend: [
				{ amount: spendAmount, denom: firma.Config.denom }
			],
			periodReset: {
				seconds: BigInt(Math.floor(expirationDate.getTime() / 1000)),
				nanos: (expirationDate.getTime() % 1000) * 1000000
			}
		};

		const result = await firma.FeeGrant.grantPeriodicAllowance(ledgerWallet, bobAddress, periodicAllowanceData);

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);

		const revokeResult = await firma.FeeGrant.revokeAllowance(ledgerWallet, bobAddress);
		expect(revokeResult.code).to.equal(0);
	});
});
