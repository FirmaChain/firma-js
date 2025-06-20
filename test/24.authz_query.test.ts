import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[24. Authz query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Authz getSendGrantData', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = await firma.Authz.getSendGrantData(granter, grantee);
	});

	it('Authz getGenericGrantData', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		const result = (await firma.Authz.getGenericGrantData(granter, grantee, msg)).dataList;
	});

	it('Authz getStakingGrantData - delegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = (await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE)).dataList;
	});

	it('Authz getStakingGrantData - redelegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = (await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE)).dataList;
	});

	it('Authz getStakingGrantData - undelegate', async () => {

		const granter = await (await firma.Wallet.fromMnemonic(aliceMnemonic)).getAddress();
		const grantee = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = (await firma.Authz.getStakingGrantData(granter, grantee, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE)).dataList;
	});
});