import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz/AuthzTxTypes';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[23. Authz Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	// grant type check
	// authorization_type="send"|"generic"|"delegate"|"unbond"|"redelegate"

	it('Authz Grant Send', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		// spend-limit should be greater than zero
		const maxFCT = 10;

		var result = await firma.Authz.grantSendAuthorization(aliceWallet, bobAddress, expirationDate, maxFCT);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Send', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const toAddress = await bobWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const bankTxClient = firma.Bank.getTxClient(aliceWallet);

		let msgSend = bankTxClient.msgSend({
			fromAddress: address,
			toAddress: toAddress,
			amount: [sendAmount]
		});

		const anyData = bankTxClient.getAnyData(msgSend)

		var result = await firma.Authz.executeAllowance(bobWallet, [anyData]);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Authz Revoke Send', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeSendAuthorization(aliceWallet, bobAddress);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant Delegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		// if set zero, unlimited delegation enabled.
		const maxFCT = 100;

		var result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expirationDate, maxFCT);

		// in case of undefine maxFCT
		//var result = await firma.Authz.grantStakeAuthorization(wallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expirationDate);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Delegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const stakingTxClient = firma.Staking.getTxClient(aliceWallet);

		let msgDelegate = stakingTxClient.msgDelegate({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
			amount: sendAmount
		});

		const anyData = stakingTxClient.getAnyData(msgDelegate)

		var result = await firma.Authz.executeAllowance(bobWallet, [anyData]);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Authz Revoke Delegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant UnDelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const maxFCT = 10;

		var result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expirationDate, maxFCT);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Undelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const stakingTxClient = firma.Staking.getTxClient(aliceWallet);

		let msgUndelegate = stakingTxClient.msgUndelegate({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
			amount: sendAmount
		});

		const anyData = stakingTxClient.getAnyData(msgUndelegate)

		var result = await firma.Authz.executeAllowance(bobWallet, [anyData]);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});


	it.skip('Authz Revoke UnDelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant ReDelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const maxFCT = 10;

		var result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, validatorAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, expirationDate, maxFCT);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Authz ExecuteAllowance-ReDelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorSrcAddress = delegationInfo[0].delegation.validator_address;

		// INFO: add a year expiration to test.		
		// for test 
		//const validatorDstAddress = delegationInfo[1].delegation.validator_address;
		const validatorDstAddress = validatorSrcAddress;

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const stakingTxClient = firma.Staking.getTxClient(aliceWallet);

		let msgRedelegate = stakingTxClient.msgRedelegate({
			delegatorAddress: address,
			validatorSrcAddress: validatorSrcAddress,
			validatorDstAddress: validatorDstAddress,
			amount: sendAmount
		});

		const anyData = stakingTxClient.getAnyData(msgRedelegate)

		var result = await firma.Authz.executeAllowance(bobWallet, [anyData]);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Authz Revoke ReDelegate', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	// GenericAuthorization: MsgWithdrawDelegatorReward case
	it('Authz Grant-GenericAuthorization MsgWithdrawDelegatorReward', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		// add a year expiration to test.
		var expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		var result = await firma.Authz.grantGenericAuthorization(aliceWallet, bobAddress, msg, expirationDate);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it('Authz GenericAuthorization ExecuteAllowance-MsgWithdrawDelegatorReward', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress());
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const amountFCT = 10;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const distributionTxClient = firma.Distribution.getTxClient(aliceWallet);

		let msgWithdrawDelegatorReward = distributionTxClient.msgWithdrawDelegatorReward({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
		});

		const anyData = distributionTxClient.getAnyData(msgWithdrawDelegatorReward)

		var result = await firma.Authz.executeAllowance(bobWallet, [anyData]);

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});

	it.skip('Authz Revoke-GenericAuthorization MsgWithdrawDelegatorReward', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msgType = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
		var result = await firma.Authz.revokeGenericAuthorization(aliceWallet, bobAddress, msgType)

		//console.log(result);

		expect(result.code).to.be.equal(0);
	});
});