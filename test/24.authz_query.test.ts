import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { Timestamp } from '../sdk/firmachain/google/protobuf/timestamp';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[24. Authz query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('Authz getSendGrantData', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		let result = await firma.Authz.getSendGrantData(granter, grantee);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.spend_limit[0].denom);
		console.log(result[0].authorization.spend_limit[0].amount);

		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getGenericGrantData', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		let result = await firma.Authz.getGenericGrantData(granter, grantee, msg);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.msg);

		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - delegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		let result = await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - redelegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		let result = await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});

	it('Authz getStakingGrantData - undelegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		let result = await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);

		/*console.log(result[0].authorization['@type']);
		console.log(result[0].authorization.allow_list.address[0]);
		console.log(result[0].authorization.authorization_type);

		console.log(result[0].authorization.max_tokens.denom);
		console.log(result[0].authorization.max_tokens.amount);
		
		let timeDate = Date.parse(result[0].expiration);
		console.log(timeDate);*/
	});
});