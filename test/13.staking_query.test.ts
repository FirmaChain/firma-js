import { expect } from 'chai';
import { FirmaConfig } from '../sdk/FirmaConfig';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { StakingValidatorStatus } from '../sdk/FirmaStakingService';
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[13. Staking Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('1.get total validator list', async () => {

		// default : StakingValidatorStatus.ALL
		var result = await firma.Staking.getValidatorList();
		//console.log(result);

		//var result = await firma.Staking.getValidatorList(StakingValidatorStatus.ALL);
		//console.log(result);

		//var result = await firma.Staking.getValidatorList(StakingValidatorStatus.BONDED);
		//console.log(result);

		//var result = await firma.Staking.getValidatorList(StakingValidatorStatus.UNBONDING);
		//console.log(result);

		//var result = await firma.Staking.getValidatorList(StakingValidatorStatus.UNBONDED);
		//console.log(result);

		//console.log(result.dataList[0].consensus_pubkey['@type']);
		//console.log(result.dataList[0].consensus_pubkey.key);

		//console.log(result);
	})

	it('2.get validator data', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		var result = await firma.Staking.getValidator(validatorList[0].operator_address);
		//console.log(result);
	})

	it('3.get getDelegationListFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		var result = await firma.Staking.getDelegationListFromValidator(validatorList[0].operator_address);
		//console.log(result);
	})

	it('4.get getUndelegationListFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		var result = await firma.Staking.getUndelegationListFromValidator(validatorList[0].operator_address);

		//console.log(result);
	})

	// param side
	it('5.get staking total pool', async () => {

		var result = await firma.Staking.getPool();

		// bonded_token, not_bonded_tokens
		//console.log(result);
	})


	it('6.get getParams', async () => {

		var result = await firma.Staking.getParams();
		//console.log(result);
	})

	// user side
	it('7.get userside getTotalDelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());

		//console.log(result);
	})

	it('8.get userside getTotalRedelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalRedelegationInfo(await wallet.getAddress());

		//console.log(result);
	})

	it('9.get userside getTotalUndelegateInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalUndelegateInfo(await wallet.getAddress());

		//console.log(result);
	})

	it('10.get userside getDelegationInfoFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getDelegationInfoFromValidator(await wallet.getAddress(), validatorList[0].operator_address);

		// If there is no data in the list, throw 404 exception.
		//console.log(result);
	})

	it('11.get userside getUndelegationInfoFromValidator', async () => {

		var validatorList = (await firma.Staking.getValidatorList()).dataList;
		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		await firma.Staking.undelegate(wallet, validatorList[0].operator_address, 1);
		var result = await firma.Staking.getUndelegationInfoFromValidator(await wallet.getAddress(), validatorList[0].operator_address);

		// If there is no data in the list, throw 404 exception.
		//console.log(result);
	})
});