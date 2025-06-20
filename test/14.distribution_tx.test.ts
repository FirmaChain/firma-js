import { expect } from 'chai';
import { FirmaUtil } from '..';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[14. Distribution Tx Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('withdrawAllRewards for delegator side', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const delegationList = (await firma.Staking.getTotalDelegationInfo(await wallet.getAddress())).dataList;
		const validatorAddress = delegationList[0].delegation.validator_address;

		const result = await firma.Distribution.withdrawAllRewards(wallet, validatorAddress);
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for All Validators', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const delegationList = (await firma.Staking.getTotalDelegationInfo(await wallet.getAddress())).dataList;
		const gasEstimation = await firma.Distribution.getGasEstimationWithdrawAllRewardsFromAllValidator(wallet, delegationList);

		const result = await firma.Distribution.withdrawAllRewardsFromAllValidator(wallet, delegationList, { gas: gasEstimation, fee: gasEstimation });
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for validator side', async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const result = await firma.Distribution.withdrawAllRewards(wallet, validatorAddress);
		expect(result.code).to.equal(0);
	});

	it('WithdrawValidatorCommission OK', async () => {

		// CHECK : validatorMnemonic only valid on dev stage.
		// this command is only valid for validator not delegator.
		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const result = await firma.Distribution.withdrawValidatorCommission(wallet, validatorAddress);
		expect(result.code).to.equal(0);
	});

	it('FundCommunityPool OK', async () => {
		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const amount = 1;

		const result = await firma.Distribution.fundCommunityPool(wallet, amount);
		expect(result.code).to.equal(0);
	});

	it('SetWithdrawAddress OK', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const result = await firma.Distribution.setWithdrawAddress(aliceWallet, await bobWallet.getAddress());
		expect(result.code).to.equal(0);

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const result1 = await firma.Distribution.withdrawAllRewards(aliceWallet, validatorAddress);
		expect(result1.code).to.equal(0);
	});
});