import { expect } from 'chai';
import { AuthorizationType } from '../sdk/firmachain/authz';
import { BankTxClient } from '../sdk/firmachain/bank';
import { DistributionTxClient } from '../sdk/firmachain/distribution';
import { StakingTxClient } from '../sdk/firmachain/staking';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[23. Authz Tx Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	// grant type check
	// authorization_type="send"|"generic"|"delegate"|"unbond"|"redelegate"

	it('Authz Grant Send', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();
		// add a year expiration to test.
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		// spend-limit should be greater than zero
		const maxFCT = 10;
		const result = await firma.Authz.grantSendAuthorization(aliceWallet, bobAddress, expirationDate, maxFCT);
		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Send', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const toAddress = await bobWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgSend = BankTxClient.msgSend({
			fromAddress: address,
			toAddress: toAddress,
			amount: [sendAmount]
		});
		const anyData = FirmaUtil.getAnyData(BankTxClient.getRegistry(), msgSend);

		const result = await firma.Authz.executeAllowance(bobWallet, [anyData]);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke Send', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		var result = await firma.Authz.revokeSendAuthorization(aliceWallet, bobAddress);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant Delegate', async () => {

		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;
		// add a year expiration to test.
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		// if set zero, unlimited delegation enabled.
		const maxFCT = 100;

		const result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_DELEGATE, expirationDate, maxFCT);
		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Delegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;
		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgDelegate = StakingTxClient.msgDelegate({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
			amount: sendAmount
		});
		const anyData = FirmaUtil.getAnyData(StakingTxClient.getRegistry(), msgDelegate);

		const result = await firma.Authz.executeAllowance(bobWallet, [anyData]);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke Delegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_DELEGATE);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant UnDelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;
		// add a year expiration to test.
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		const result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE, expirationDate, maxFCT);
		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-Undelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;

		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };

		const msgUndelegate = StakingTxClient.msgUndelegate({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
			amount: sendAmount
		});
		const anyData = FirmaUtil.getAnyData(StakingTxClient.getRegistry(), msgUndelegate)
		const gas = await firma.Authz.getGasEstimationExecuteAllowance(bobWallet, [anyData]);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Authz.executeAllowance(bobWallet, [anyData], { gas, fee });
		expect(result.code).to.be.equal(0);
	});


	it('Authz Revoke UnDelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Grant ReDelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const maxFCT = 10;

		const result = await firma.Authz.grantStakeAuthorization(aliceWallet, bobAddress, [validatorAddress], AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE, expirationDate, maxFCT);
		expect(result.code).to.be.equal(0);
	});

	it('Authz ExecuteAllowance-ReDelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorSrcAddress = delegationInfo[0].delegation.validator_address;

		// INFO: add a year expiration to test.		
		// for test 
		//const validatorDstAddress = delegationInfo[1].delegation.validator_address;
		const validatorDstAddress = validatorSrcAddress;
		const amountFCT = 9;
		const address = await aliceWallet.getAddress();
		const sendAmount = { denom: firma.Config.denom, amount: FirmaUtil.getUFCTStringFromFCT(amountFCT) };
		const msgRedelegate = StakingTxClient.msgRedelegate({
			delegatorAddress: address,
			validatorSrcAddress: validatorSrcAddress,
			validatorDstAddress: validatorDstAddress,
			amount: sendAmount
		});
		const anyData = FirmaUtil.getAnyData(StakingTxClient.getRegistry(),msgRedelegate)

		const result = await firma.Authz.executeAllowance(bobWallet, [anyData]);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke ReDelegate', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const result = await firma.Authz.revokeStakeAuthorization(aliceWallet, bobAddress, AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE);
		expect(result.code).to.be.equal(0);
	});

	// GenericAuthorization: MsgWithdrawDelegatorReward case
	it('Authz Grant-GenericAuthorization MsgWithdrawDelegatorReward', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const msg = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		// add a year expiration to test.
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		const result = await firma.Authz.grantGenericAuthorization(aliceWallet, bobAddress, msg, expirationDate);
		expect(result.code).to.be.equal(0);
	});

	it('Authz GenericAuthorization ExecuteAllowance-MsgWithdrawDelegatorReward', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const delegationInfo = (await firma.Staking.getTotalDelegationInfo(await aliceWallet.getAddress())).dataList;
		const validatorAddress = delegationInfo[0].delegation.validator_address;
		const address = await aliceWallet.getAddress();
		const msgWithdrawDelegatorReward = DistributionTxClient.msgWithdrawDelegatorReward({
			delegatorAddress: address,
			validatorAddress: validatorAddress,
		});
		const anyData = FirmaUtil.getAnyData(DistributionTxClient.getRegistry(), msgWithdrawDelegatorReward)

		const result = await firma.Authz.executeAllowance(bobWallet, [anyData]);
		expect(result.code).to.be.equal(0);
	});

	it('Authz Revoke-GenericAuthorization MsgWithdrawDelegatorReward', async () => {
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();
		const msgType = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

		const result = await firma.Authz.revokeGenericAuthorization(aliceWallet, bobAddress, msgType)
		expect(result.code).to.be.equal(0);
	});
});