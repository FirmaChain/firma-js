import { expect } from 'chai';
import { FirmaUtil, FirmaWalletService } from '..';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[14. Distribution Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;
	let validatorWallet: FirmaWalletService;
	let validatorAddress: string;
	let valOperAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
		validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		validatorAddress = await validatorWallet.getAddress();
		valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);
	})

	it('withdrawAllRewards for delegator side', async () => {

		const delegationList = (await firma.Staking.getTotalDelegationInfo(aliceAddress)).dataList;
		const validatorAddress = delegationList[0].delegation.validator_address;

		const result = await firma.Distribution.withdrawAllRewards(aliceWallet, validatorAddress);
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for All Validators', async () => {

		const delegationList = (await firma.Staking.getTotalDelegationInfo(aliceAddress)).dataList;
		const gasEstimation = await firma.Distribution.getGasEstimationWithdrawAllRewardsFromAllValidator(aliceWallet, delegationList);

		const result = await firma.Distribution.withdrawAllRewardsFromAllValidator(aliceWallet, delegationList, { gas: gasEstimation, fee: gasEstimation });
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for validator side', async () => {

		const result = await firma.Distribution.withdrawAllRewards(validatorWallet, valOperAddress);
		expect(result.code).to.equal(0);
	});

	it('WithdrawValidatorCommission OK', async () => {

		// CHECK : validatorMnemonic only valid on dev stage.
		// this command is only valid for validator not delegator.
		const result = await firma.Distribution.withdrawValidatorCommission(validatorWallet, valOperAddress);
		expect(result.code).to.equal(0);
	});

	it('FundCommunityPool OK', async () => {

		const amount = 1;
		const result = await firma.Distribution.fundCommunityPool(aliceWallet, amount);
		expect(result.code).to.equal(0);
	});

	it('SetWithdrawAddress OK', async () => {

		const result = await firma.Distribution.setWithdrawAddress(aliceWallet, bobAddress);
		expect(result.code).to.equal(0);

		const result1 = await firma.Distribution.withdrawAllRewards(aliceWallet, valOperAddress);
		expect(result1.code).to.equal(0);
	});
});