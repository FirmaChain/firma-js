import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[23. Authz Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('Authz Grant Delegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const maxFCT = 100000000;
		
		var result = await firma.Authz.grantStakeAuthorization(wallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, maxFCT, expirationDate);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke Delegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(wallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});


	it('Authz Grant UnDelegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const maxFCT = 100000000;
		
		var result = await firma.Authz.grantStakeAuthorization(wallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, maxFCT, expirationDate);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke UnDelegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(wallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant ReDelegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const maxFCT = 100000000;
		
		var result = await firma.Authz.grantStakeAuthorization(wallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, maxFCT, expirationDate);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke ReDelegate', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(wallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});

	// MsgWithdrawDelegatorReward case
	it('Authz Grant-GenericAuthorization MsgWithdrawDelegatorReward', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
		
		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		var result = await firma.Authz.grantGenericAuthorization(wallet, bobAddress, msg, expirationDate);

		console.log(result);

		expect(result.code).to.be.equal(0);
	});


	it('Authz Revoke-GenericAuthorization MsgWithdrawDelegatorReward', async () => {
		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msgType = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
		var result = await firma.Authz.revokeGenericAuthorization(wallet, bobAddress, msgType)

		console.log(result);

		expect(result.code).to.be.equal(0);
	});
});