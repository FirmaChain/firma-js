import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[24. Authz query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;
	
	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		await initializeGrant();
	})

	const initializeGrant = async function () {

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(aliceAddress)).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// getSendGrantData
		const amountFCT = 9;
		const grantResult = await firma.Authz.grantSendAuthorization(aliceWallet, bobAddress, expirationDate, amountFCT);
		expect(grantResult.code).to.equal(0);

		// Grant-GenericAuthorization
		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
		const genericResult = await firma.Authz.grantGenericAuthorization(aliceWallet, bobAddress, msg, expirationDate);
		expect(genericResult.code).to.be.equal(0);

		// getStakingGrantData - delegate
		const maxFCT = 100;
		const delegateResult = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expirationDate, maxFCT);
		expect(delegateResult.code).to.be.equal(0);

		// getStakingGrantData - redelegate
		const redelegateResult = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, expirationDate, maxFCT);
		expect(redelegateResult.code).to.be.equal(0);

		// getStakingGrantData - undelegate
		const undelegateResult = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expirationDate, maxFCT);
		expect(undelegateResult.code).to.be.equal(0);
	};

	it('Authz getSendGrantData', async () => {

		const result = (await firma.Authz.getSendGrantData(aliceAddress, bobAddress)).dataList;
		expect(result.length).to.be.greaterThan(0);

		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');

		const revokeResult = await firma.Authz.revokeSendAuthorization(aliceWallet, bobAddress);
		expect(revokeResult.code).to.equal(0);
	});

	it('Authz getGenericGrantData', async () => {

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const amountFCT = 9;

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
		const result = (await firma.Authz.getGenericGrantData(aliceAddress, bobAddress, msg)).dataList;

		// This test may fail if the grant does not exist.
		expect(result.length).to.be.greaterThan(0);
		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');
	});

	it('Authz getStakingGrantData - delegate', async () => {

		const result = (await firma.Authz.getStakingGrantData(aliceAddress, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE)).dataList;
		
		// This test may fail if the grant does not exist.
		expect(result.length).to.be.greaterThan(0);

		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');
	});

	it('Authz getStakingGrantData - redelegate', async () => {

		const result = (await firma.Authz.getStakingGrantData(aliceAddress, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE)).dataList;
		
		// This test may fail if the grant does not exist.
		expect(result.length).to.be.greaterThan(0);

		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');
	});

	it('Authz getStakingGrantData - undelegate', async () => {

		const result = (await firma.Authz.getStakingGrantData(aliceAddress, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE)).dataList;
		
		// This test may fail if the grant does not exist.
		expect(result.length).to.be.greaterThan(0);

		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');
	});
});