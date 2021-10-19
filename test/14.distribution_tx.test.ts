import { expect } from 'chai';
import { FirmaUtil } from '..';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[14. Distribution Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('withdrawAllRewards for delegator side', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const delegationList = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());

		let validatorAddress = delegationList[0].delegation.validator_address

		var result = await firma.Distribution.withdrawAllRewards(wallet, validatorAddress);
		expect(result.code).to.equal(0);
	});

	it('withdrawAllRewards for validator side', async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();

		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		var result = await firma.Distribution.withdrawAllRewards(wallet, validatorAddress);

		expect(result.code).to.equal(0);
	});

	it('WithdrawValidatorCommission OK', async () => {

		// CHECK : validatorMnemonic only valid on dev stage.
		// this command is only valid for validator not delegator.

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();

		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		var result = await firma.Distribution.withdrawValidatorCommission(wallet, validatorAddress);

		expect(result.code).to.equal(0);
	});

	it('FundCommunityPool OK', async () => {
		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const amount = 1;

		var result = await firma.Distribution.fundCommunityPool(wallet, amount);
		expect(result.code).to.equal(0);
	});

	it('SetWithdrawAddress OK', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		//console.log(await aliceWallet.getAddress());
		//console.log(await bobWallet.getAddress());

		//console.log(await firma.Bank.getBalance(await aliceWallet.getAddress()));
		//console.log(await firma.Bank.getBalance(await bobWallet.getAddress()));

		var result = await firma.Distribution.setWithdrawAddress(aliceWallet, await bobWallet.getAddress());
		expect(result.code).to.equal(0);

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		var result1 = await firma.Distribution.withdrawAllRewards(aliceWallet, validatorAddress);
		//console.log(result1);
		expect(result1.code).to.equal(0);

		//console.log(await firma.Bank.getBalance(await aliceWallet.getAddress()));
		//console.log(await firma.Bank.getBalance(await bobWallet.getAddress()));
	});
});