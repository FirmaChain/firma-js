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
	})

	it('Authz getSendGrantData', async () => {

		const result = (await firma.Authz.getSendGrantData(aliceAddress, bobAddress)).dataList;
		
		// This test may fail if the grant does not exist.
		expect(result.length).to.be.greaterThan(0);

		const grant = result[0];
		expect(grant).to.have.property('authorization');
		expect(grant).to.have.property('expiration');
	});

	it('Authz getGenericGrantData', async () => {

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