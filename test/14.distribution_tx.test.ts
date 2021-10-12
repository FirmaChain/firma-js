import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[14. Distribution Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('withdrawAllRewards OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorList = await firma.Staking.getValidatorList();
		const validatorAddress = validatorList[0].operator_address;

		var result = await firma.Distribution.withdrawAllRewards(wallet, validatorAddress);

		// CHECK: Why can't I find out how much I received on the result log?
		// Anyway, it seems that it will come out if you check the tx hash value.

		// It is expected that there will be a difference in quantity at the time of call and receive.

		expect(result.code).to.equal(0);
	});

	it('WithdrawValidatorCommission OK', async () => {

		// CHECK : validatorMnemonic only valid on dev stage.
		// this command is only valid for validator not delegator.

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorList = await firma.Staking.getValidatorList();
		const validatorAddress = validatorList[0].operator_address;

		var result = await firma.Distribution.WithdrawValidatorCommission(wallet, validatorAddress);

		//console.log(result);

		expect(result.code).to.equal(0);
	});

	it('FundCommunityPool OK', async () => {
		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const amount = 1;

		var result = await firma.Distribution.FundCommunityPool(wallet, amount);
		expect(result.code).to.equal(0);
	});

	it('SetWithdrawAddress OK', async () => {

		//NOTICE: The change was successful, but I didn't understand who and how to receive it. I'll do it again.

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		var result = await firma.Distribution.SetWithdrawAddress(validatorWallet, await aliceWallet.getAddress());
		expect(result.code).to.equal(0);
	});
});