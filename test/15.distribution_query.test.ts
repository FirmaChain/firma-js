import { expect } from 'chai';
import { FirmaUtil } from '..';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[15. Distribution Query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('get communityPool', async () => {

		var poolAmount = await firma.Distribution.getCommunityPool();
		console.log("communityPool :" + poolAmount);
	})

	it('get validator commission', async () => {

		let validatorList = await firma.Staking.getValidatorList();
		let validatorAddress = validatorList[0].operator_address;

		var result = await firma.Distribution.getValidatorCommission(validatorAddress);
		//console.log(result[0]);
	})

	it('get validator outstanding_rewards', async () => {

		let validatorList = await firma.Staking.getValidatorList();
		let validatorAddress = validatorList[0].operator_address;

		var result = await firma.Distribution.getValidatorOutStandingReward(validatorAddress);
		//console.log(result[0]);
	})

	it('get validator self delegator\'s reward', async () => {

		let validatorList = await firma.Staking.getValidatorList();
		let validatorAddress = validatorList[0].operator_address;

		let address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		let result = await firma.Distribution.getTotalRewardInfo(address);

		//console.log("validatorAddress: " + validatorAddress);
		//console.log("address: " + address);
		//console.log(result);
	})

	it('get commission from self delegator', async () => {

		let validatorList = await firma.Staking.getValidatorList();
		let validatorAddress = validatorList[0].operator_address;

		let address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		let newValidatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		let commission = await firma.Distribution.getValidatorCommission(newValidatorAddress);
		//console.log(commission[0]);
	})

	// Total Reward based user side
	// Additionally, rewards for each validator data are included. On the list.
	it('get getTotalRewardInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		// INFO: All the validator information and interests information that the user needs to receive can be viewed here.
		var result = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());

		for (var i = 0; i < result.rewards.length; i++) {
			//console.log("validator_address: " + result.rewards[i].validator_address);
			//console.log("reward: " + result.rewards[i].amount);
		}

		var totalReward = result.total;
		//console.log("totalReward: " + totalReward);
	})

	// reward per validator
	it('get getRewardInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		var totalReward = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());

		const validatorAddress = totalReward.rewards[0].validator_address;
		var amount = await firma.Distribution.getRewardInfo(await wallet.getAddress(), validatorAddress);

		//console.log("validator_address: " + validatorAddress);
		//console.log("reward: " + amount);
	})

	it('get getTotalRewardInfo from no balance user', async () => {

		const wallet = await firma.Wallet.newWallet();

		var result = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());
		expect(result.total).to.equal("");
	})

	// reward per validator
	it('get getRewardInfo from no balance user', async () => {

		const wallet = await firma.Wallet.newWallet();

		var totalReward = await firma.Distribution.getTotalRewardInfo(await wallet.getAddress());
		expect(totalReward.rewards.length).to.equal(0);
	})
});