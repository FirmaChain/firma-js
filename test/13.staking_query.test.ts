import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[13. Staking Query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('1.get total validator list', async () => {

		var result = await firma.Staking.getValidatorList();
		//console.log(result);
	})

	it('2.get validator data', async () => {

		var validatorList = await firma.Staking.getValidatorList();
		var result = await firma.Staking.getValidator(validatorList[0].operator_address);
		//console.log(result);
	})

	it('3.get getDelegationListFromValidator', async () => {

		var validatorList = await firma.Staking.getValidatorList();
		var result = await firma.Staking.getDelegationListFromValidator(validatorList[0].operator_address);
		//console.log(result);
	})

	it('4.get getUndelegationListFromValidator', async () => {

		var validatorList = await firma.Staking.getValidatorList();
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
});