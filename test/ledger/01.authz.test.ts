/**
 * Ledger Authz Tx Test
 *
 * Requires a physical Ledger device connected via USB with the FirmaChain app open.
 *
 * Run:
 *   npx mocha test/ledger/01.authz.test.ts -r ts-node/register --timeout 1200000
 */

import { expect } from 'chai';
import TransportNodeHID from '@ledgerhq/hw-transport-node-hid';

import { AuthorizationType } from '../../sdk/firmachain/authz';
import { FirmaSDK } from '../../sdk/FirmaSDK';
import { FirmaWalletService } from '../../sdk/FirmaWalletService';
import { FirmaCosmosLedgerWallet } from '../../sdk/firmachain/common/FirmaLedger';
import { bobMnemonic, TestChainConfig } from '../config_test';

describe('[01. Ledger Authz Tx Test]', () => {

	let firma: FirmaSDK;
	let ledgerWallet: FirmaWalletService;
	let ledgerAddress: string;
	let bobAddress: string;

	const oneDayExpiration = () => {
		const date = new Date();
		date.setDate(date.getDate() + 1);
		return {
			seconds: BigInt(Math.floor(date.getTime() / 1000)),
			nanos: (date.getTime() % 1000) * 1000000
		};
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

	it('Authz Grant Send via Ledger', async function() {
		this.timeout(120000);

		const maxFCT = 10;
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantSendAuthorization(ledgerWallet, bobAddress, expiration, maxFCT);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantSendAuthorization(ledgerWallet, bobAddress, expiration, maxFCT, { gas, fee });
		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Revoke Send via Ledger', async function() {
		this.timeout(120000);

		const gas = await firma.Authz.getGasEstimationRevokeSendAuthorization(ledgerWallet, bobAddress);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.revokeSendAuthorization(ledgerWallet, bobAddress, { gas, fee });
		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Grant Delegate via Ledger', async function() {
		this.timeout(120000);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const maxFCT = 100;
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantStakeAuthorization(ledgerWallet, bobAddress, [validatorAddress],
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expiration, maxFCT);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantStakeAuthorization(ledgerWallet, bobAddress, [validatorAddress],
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expiration, maxFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Revoke Delegate via Ledger', async function() {
		this.timeout(120000);

		const gas = await firma.Authz.getGasEstimationRevokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.revokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Grant Undelegate via Ledger', async function() {
		this.timeout(120000);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const maxFCT = 10;
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantStakeAuthorization(ledgerWallet, bobAddress, [validatorAddress],
			AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expiration, maxFCT);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantStakeAuthorization(ledgerWallet, bobAddress, [validatorAddress],
			AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expiration, maxFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Revoke Undelegate via Ledger', async function() {
		this.timeout(120000);

		const gas = await firma.Authz.getGasEstimationRevokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.revokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Grant Redelegate via Ledger', async function() {
		this.timeout(120000);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(ledgerAddress)).dataList;
		if (delegationInfo.length < 2) {
			console.log('[Ledger] skip redelegate grant: need at least two delegations');
			this.skip();
		}
		const validatorAddress1 = delegationInfo[0].delegation.validator_address;
		const validatorAddress2 = delegationInfo[1].delegation.validator_address;

		const maxFCT = 10;
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantStakeAuthorization(ledgerWallet, bobAddress,
			[validatorAddress1, validatorAddress2], AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE,
			expiration, maxFCT);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantStakeAuthorization(ledgerWallet, bobAddress,
			[validatorAddress1, validatorAddress2], AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE,
			expiration, maxFCT, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Revoke Redelegate via Ledger', async function() {
		this.timeout(120000);

		const gas = await firma.Authz.getGasEstimationRevokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.revokeStakeAuthorization(ledgerWallet, bobAddress,
			AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, { gas, fee });

		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Grant GenericAuthorization (MsgWithdrawDelegatorReward) via Ledger', async function() {
		this.timeout(120000);

		const msgType = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';
		const expiration = oneDayExpiration();

		const gas = await firma.Authz.getGasEstimationGrantGenericAuthorization(ledgerWallet, bobAddress, msgType, expiration);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.grantGenericAuthorization(ledgerWallet, bobAddress, msgType, expiration, { gas, fee });
		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});

	it('Authz Revoke GenericAuthorization (MsgWithdrawDelegatorReward) via Ledger', async function() {
		this.timeout(120000);

		const msgType = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';

		const gas = await firma.Authz.getGasEstimationRevokeGenericAuthorization(ledgerWallet, bobAddress, msgType);
		const fee = Math.ceil(gas * 0.1);
		console.log('[Ledger] gas:', gas, 'fee:', fee);

		const result = await firma.Authz.revokeGenericAuthorization(ledgerWallet, bobAddress, msgType, { gas, fee });
		console.log('[Ledger] result code:', result.code);
		expect(result.code).to.equal(0);
	});
});
