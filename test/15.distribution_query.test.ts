import { expect } from 'chai';
import { FirmaUtil } from '..';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[15. Distribution Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('get communityPool', async () => {

		const poolAmount = await firma.Distribution.getCommunityPool();
		expect(poolAmount).to.not.equal("");
	})

	it('get validator commission', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const result = await firma.Distribution.getValidatorCommission(validatorAddress);
		if (result.length > 0) {
			expect(result[0].amount).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	})

	it('get validator outstanding_rewards', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const result = await firma.Distribution.getValidatorOutStandingReward(validatorAddress);
		if (result.length > 0) {
			expect(result[0].amount).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	})

	it('get validator self delegator\'s reward', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		const result = await firma.Distribution.getTotalRewardInfo(address);
	})

	it('get commission from self delegator', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		const newValidatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const commission = await firma.Distribution.getValidatorCommission(newValidatorAddress);
	})

	// Total Reward based user side
	// Additionally, rewards for each validator data are included. On the list.
	it('get getTotalRewardInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		// INFO: All the validator information and interests information that the user needs to receive can be viewed here.
		const result = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());
		const totalReward = result.total;
	})

	// reward per validator
	it('get getRewardInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const totalReward = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());

		const validatorAddress = totalReward.rewards[0].validator_address;
		const amount = await firma.Distribution.getRewardInfo(await wallet.getAddress(), validatorAddress);
	})

	it('get withdrawAddress', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const withdrawAddress = await firma.Distribution.getWithdrawAddress(await wallet.getAddress());
	})

	it('get getTotalRewardInfo from no balance user', async () => {

		const wallet = await firma.Wallet.newWallet();

		const result = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());
		expect(result.total).to.equal("");
	})

	// reward per validator
	it('get getRewardInfo from no balance user', async () => {

		const wallet = await firma.Wallet.newWallet();

		const totalReward = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());
		expect(totalReward.rewards.length).to.equal(0);
	})
});