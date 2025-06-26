import { expect } from 'chai';
import { FirmaUtil, FirmaWalletService } from '..';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, TestChainConfig } from './config_test';

describe('[15. Distribution Query Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
	})

	it('get communityPool', async () => {

		const poolAmount = await firma.Distribution.getCommunityPool();
		expect(poolAmount).to.not.equal("");
	});

	it('get validator commission', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const result = await firma.Distribution.getValidatorCommission(validatorAddress);
		if (result.length > 0) {
			expect(result[0].amount).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('get validator outstanding_rewards', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const result = await firma.Distribution.getValidatorOutStandingReward(validatorAddress);
		if (result.length > 0) {
			expect(result[0].amount).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('get validator self delegator\'s reward', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		const result = await firma.Distribution.getTotalRewardInfo(address);

		expect(result.rewards).to.not.equal("");
	});

	it('get commission from self delegator', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const validatorAddress = validatorList[0].operator_address;

		const address = FirmaUtil.getAccAddressFromValOperAddress(validatorAddress);
		const newValidatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const commission = await firma.Distribution.getValidatorCommission(newValidatorAddress);
		expect(commission.length).to.not.equal(0);
	});

	// Total Reward based user side
	// Additionally, rewards for each validator data are included. On the list.
	it('get getTotalRewardInfo', async () => {

		// INFO: All the validator information and interests information that the user needs to receive can be viewed here.
		const result = await firma.Distribution.getTotalRewardInfo(aliceAddress);
		if (result.rewards.length === 0) {
			expect(result.total).to.be.equal('');
		} else {
			expect(result.total).to.not.equal('');
		}
	});

	// reward per validator
	it('get getRewardInfo', async () => {

		const totalReward = await firma.Distribution.getTotalRewardInfo(aliceAddress);

		if (totalReward.rewards.length > 0) {
			const validatorAddress = totalReward.rewards[0].validator_address;
			const amount = await firma.Distribution.getRewardInfo(aliceAddress, validatorAddress);
			expect(amount).to.not.equal('');
		} else {
			expect(true).to.be.equal(false);
		}
	});

	it('get withdrawAddress', async () => {

		const withdrawAddress = await firma.Distribution.getWithdrawAddress(aliceAddress);
		expect(FirmaUtil.isValidAddress(withdrawAddress)).to.be.equal(true);
	});

	it('get getTotalRewardInfo from no balance user', async () => {

		const newWallet = await firma.Wallet.newWallet();
		const newAddress = await newWallet.getAddress();

		const result = await firma.Distribution.getTotalRewardInfo(newAddress);
		expect(result.total).to.equal("");
	});

	// reward per validator
	it('get getRewardInfo from no balance user', async () => {

		const newWallet = await firma.Wallet.newWallet();
		const newAddress = await newWallet.getAddress()

		const totalReward = await firma.Distribution.getTotalRewardInfo(newAddress);
		expect(totalReward.rewards.length).to.equal(0);
	});
});