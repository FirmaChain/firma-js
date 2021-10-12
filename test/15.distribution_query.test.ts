import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[15. Distribution Query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('get communityPool', async () => {

		var poolAmount = await firma.Distribution.getCommunityPool();
		//console.log("communityPool :" + poolAmount);
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

		for (var i = 0; i < totalReward.rewards.length; i++) {
			const validatorAddress = totalReward.rewards[i].validator_address;
			var amount = await firma.Distribution.getRewardInfo(await wallet.getAddress(), validatorAddress);

			//console.log("validator_address: " + validatorAddress);
			//console.log("reward: " + amount);
		}
	})
});