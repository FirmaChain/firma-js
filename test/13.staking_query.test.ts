import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[13. Staking Query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('get validator list', async () => {

		var result = await firma.Staking.getValidatorList();
		expect(result.length).to.above(0);

		//console.log(result[0].grantee);
		//console.log("total: " + result.length);
		//console.log("commission_rates.max_rate:" + result[0].commission.commission_rates.max_rate);
	})

	it('get pool', async () => {

		var result = await firma.Staking.getPool();
		//console.log(result.bonded_tokens);
		//console.log(result.not_bonded_tokens);
	})

	it('get getParams', async () => {

		var result = await firma.Staking.getParams();
		//console.log(result);
	})

	// [TODO: need to implement]
	// get delegation list based validator side
	// not give total delegations, but give each user amount list.
	it.skip('get getTotalDelegationFromValidator', async () => {

		// [CHECK]
		// I'm confusing of modify return type of cosmos sdk rest api
		// Too complicated. I'm still thinking about it.

		//const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		//var result = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());

		//console.log(result);
	})

	
	// Receive a list of supplies delegated by the user.
	it('get getTotalDelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalDelegationInfo(await wallet.getAddress());

		//console.log(result);
	})

	it('get getTotalRedelegationInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalRedelegationInfo(await wallet.getAddress());

		//console.log(result);
		//console.log(result[0].entries[0].redelegation_entry.creation_height);
		//console.log(result[0].entries[0]);
	})

	it('get getTotalUnbondingInfo', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Staking.getTotalUnbondingInfo(await wallet.getAddress());

		//console.log(result);
		//console.log(result[0].entries[0]);
	})
});