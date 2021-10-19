import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[12. Staking Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('delegate OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amountFCT = 60;

		var result = await firma.Staking.delegate(wallet, validatorAddress, amountFCT);
		//console.log(result);

		expect(result.code).to.equal(0);
	});

	it('undelegate OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amount = 5;

		// if there's 7 more list on undelegatelist, occur error below
		// too many unbonding delegation entries for (delegator, validator) tuple

		var result = await firma.Staking.undelegate(wallet, validatorAddress, amount);
		expect(result.code).to.equal(0);
	});

	it('redelegate OK', async () => {

		//INFO: need two validators but starport serve support only one validator.

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const validatorList = await firma.Staking.getValidatorList();

		if (validatorList.length < 2)
			return;

		const srcValidatorAddress = validatorList[0].operator_address;
		const dstValidatorAddress = validatorList[1].operator_address;

		const amount = 10;

		let result = await firma.Staking.delegate(wallet, srcValidatorAddress, amount);
		expect(result.code).to.equal(0);

		// NOTICE: there's a case for use more than 200000 gas here.
		let result1 = await firma.Staking.redelegate(wallet, srcValidatorAddress, dstValidatorAddress, amount,
			{ gas: 300000, fee: 3000 });

		expect(result1.code).to.equal(0);
	});

	// new case added. if succeed, the dapp needs to prevent zero amount input from users.
	it('staking send Fail - send zero money', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amount = 0;

		try {
			var result = await firma.Staking.delegate(wallet, validatorAddress, amount);
		}
		catch (error) {

		}

		//expect(result.code).to.equal(5);
	});


	it('staking send Fail - send lots of money', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amount = 20000000000000;

		var result = await firma.Staking.delegate(wallet, validatorAddress, amount);

		// error code 5 : not enough money.
		expect(result.code).to.equal(5);
	});

	// NOTICE: not decide to include firma.js spec
	it.skip('editValidator OK', async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);

		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		let validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		//const inputPercentage = 0.123456; // 12.34% (Only 2 decimal places are allowed.)
		const inputPercentage = 0.098767; // 9.87% (Only 2 decimal places are allowed. 67 is expected to be thrown away.)

		var fixed = 4;
		var count = Math.pow(10, fixed);
		var number = Math.floor(inputPercentage * count) / count;
		var per = number.toFixed(fixed)// fill 0

		var per1 = Number.parseFloat(per) * 10000; // make float to int
		var fianlper = per1.toFixed(0); // drop float 

		const commissionRate = fianlper + "00000000000000"; //bigint 
		const minSelfDelegation = "100000";

		const description = {
			moniker: "firma-node-3(gom)",
			identity: "", // identity defines an optional identity signature (ex. UPort or Keybase).
			website: "https://naver.com",
			securityContact: "fly33499@gmail.com",
			details: "we're now testing to edit validator info"
		};

		var result = await firma.Staking.editValidator(wallet, validatorAddress, description, commissionRate, minSelfDelegation);

		expect(result.code).to.equal(0);
	});
});