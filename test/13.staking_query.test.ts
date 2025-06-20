import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { aliceMnemonic, TestChainConfig } from './config_test';
import { FirmaUtil } from '../sdk/FirmaUtil';

describe('[13. Staking Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('1.get total validator list', async () => {

		// default : StakingValidatorStatus.ALL
		const result = await firma.Staking.getValidatorList();
		expect(result.dataList.length > 0).to.be.equal(true);
	});

	it('2.get validator data', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const result = await firma.Staking.getValidator(validatorList[0].operator_address);
		expect(FirmaUtil.isValidAddress(result.operator_address)).to.not.equal(true);
	});

	it('3.get getDelegationListFromValidator', async () => {

		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		const result = await firma.Staking.getDelegationListFromValidator(validatorList[0].operator_address);
		if (result.dataList.length > 0) {
			expect(result.dataList[0].balance).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('4.get getUndelegationListFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		var result = await firma.Staking.getUndelegationListFromValidator(validatorList[0].operator_address);
		if (result.dataList.length > 0) {
			expect(FirmaUtil.isValidAddress(result.dataList[0].delegator_address)).to.be.equal(true);
		} else {
			expect(true).to.be.equal(true);
		}
	});

	// param side
	it('5.get staking total pool', async () => {

		var result = await firma.Staking.getPool();
		expect(result.bonded_tokens).to.not.equal("");
	});


	it('6.get getParams', async () => {

		var result = await firma.Staking.getParams();
		expect(result.max_validators).to.not.equal(0);
	});

	// user side
	it('7.get userside getTotalDelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());

		if (result.dataList.length > 0) {
			expect(result.dataList[0].balance).to.not.equal("");
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('8.get userside getTotalRedelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Staking.getTotalRedelegationInfo(await wallet.getAddress());

		if (result.length > 0) {
			expect(FirmaUtil.isValidAddress(result[0].redelegation.delegator_address)).to.be.equal(true);
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('9.get userside getTotalUndelegateInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Staking.getTotalUndelegateInfo(await wallet.getAddress());

		if (result.length > 0) {
			expect(FirmaUtil.isValidAddress(result[0].delegator_address)).to.be.equal(true);
		} else {
			expect(true).to.be.equal(true);
		}
	});

	it('10.get userside getDelegationInfoFromValidator', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorList = (await firma.Staking.getValidatorList()).dataList;

		try {
			// If there is no data in the list, throw 404 exception.
			const result = await firma.Staking.getDelegationInfoFromValidator(await wallet.getAddress(), validatorList[0].operator_address);
			expect(result.balance).to.not.equal("");
		} catch (error) {
			expect(false).to.not.equal(true);
		}
	});

	it('11.get userside getUndelegationInfoFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		try {
			// If there is no data in the list, throw 404 exception.
			const result = await firma.Staking.getUndelegationInfoFromValidator(await wallet.getAddress(), validatorList[0].operator_address);
			expect(FirmaUtil.isValidAddress(result.delegator_address)).to.be.equal(true);
		} catch (error) {
			expect(false).to.not.equal(true);
		}
	});
});