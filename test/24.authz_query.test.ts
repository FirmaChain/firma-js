import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { Timestamp } from '../sdk/firmachain/google/protobuf/timestamp';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[24. Authz query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Authz getSendGrantData', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const granter_aliceAddress = await aliceWallet.getAddress();
		const grantee_bobAddress = await bobWallet.getAddress();

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		// grant send authorization
		await firma.Authz.grantSendAuthorization(aliceWallet, grantee_bobAddress, expirationDate, maxFCT);
		// get grant data (send)
		const result = await firma.Authz.getSendGrantData(granter_aliceAddress, grantee_bobAddress);
		// revoke send authorization
		await firma.Authz.revokeSendAuthorization(aliceWallet, grantee_bobAddress);
		//console.log(result);

		/*console.log(result.dataList[0].authorization['@type']);
		console.log(result.dataList[0].authorization.spend_limit[0].denom);
		console.log(result.dataList[0].authorization.spend_limit[0].amount);

		let timeDate = Date.parse(result.dataList[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getGenericGrantData', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const granter_aliceAddress = await aliceWallet.getAddress();
		const grantee_bobAddress = await bobWallet.getAddress();

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		// grant generic authorization
		await firma.Authz.grantGenericAuthorization(aliceWallet, grantee_bobAddress, msg, expirationDate);
		// get grant data (generic)
		const result = (await firma.Authz.getGenericGrantData(granter_aliceAddress, grantee_bobAddress, msg)).dataList;
		// revoke generic authorization
		await firma.Authz.revokeGenericAuthorization(aliceWallet, grantee_bobAddress, msg);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.msg);

		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - delegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const granter_aliceAddress = await aliceWallet.getAddress();
		const grantee_bobAddress = await bobWallet.getAddress();

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// grant deletgate authorization
		await firma.Authz.grantStakeAuthorization(aliceWallet, grantee_bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expirationDate, maxFCT);
		// get grant data (delegate)
		const result = (await firma.Authz.getStakingGrantData(granter_aliceAddress, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE)).dataList;
		// revoke deletgate authorization
		await firma.Authz.revokeStakeAuthorization(aliceWallet, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);
		
		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - redelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const granter_aliceAddress = await aliceWallet.getAddress();
		const grantee_bobAddress = await bobWallet.getAddress();

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorSrcAddress = delegationInfo[0].delegation.validator_address;
		const validatorDstAddress = delegationInfo[1].delegation.validator_address;

		// grant redelegate authorization
		await firma.Authz.grantStakeAuthorization(aliceWallet, grantee_bobAddress, [validatorSrcAddress, validatorDstAddress], AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, expirationDate, maxFCT);
		// get grant data (redelegate)
		const result = (await firma.Authz.getStakingGrantData(granter_aliceAddress, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE)).dataList;
		// revoke redelegate authorization
		await firma.Authz.revokeStakeAuthorization(aliceWallet, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);


		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - undelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const granter_aliceAddress = await aliceWallet.getAddress();
		const grantee_bobAddress = await bobWallet.getAddress();

		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// grant undelegate authorization
		await firma.Authz.grantStakeAuthorization(aliceWallet, grantee_bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expirationDate, maxFCT);
		// get grant data (undelegate)
		const result = (await firma.Authz.getStakingGrantData(granter_aliceAddress, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE)).dataList;
		// revoke undelegate authorization
		await firma.Authz.revokeStakeAuthorization(aliceWallet, grantee_bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});
});