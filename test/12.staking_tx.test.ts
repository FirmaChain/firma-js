import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[12. Staking Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let validatorWallet: FirmaWalletService;
	let validatorAddress: string;
	let valOperAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		validatorAddress = await validatorWallet.getAddress();
		valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);
	})

	it('delegate OK', async () => {

		const amountFCT = 60;
		const result = await firma.Staking.delegate(aliceWallet, valOperAddress, amountFCT);
		expect(result.code).to.equal(0);
	});


	// if there's 7 more list on undelegatelist, occur error below
	// too many unbonding delegation entries for (delegator, validator) tuple
	it('undelegate OK', async () => {

		const amountFCT = 5;
		const gas = await firma.Staking.getGasEstimationUndelegate(aliceWallet, valOperAddress, amountFCT);
		const fee = Math.ceil(gas * 0.1);

		const result = await firma.Staking.undelegate(aliceWallet, valOperAddress, amountFCT, { gas, fee });
		expect(result.code).to.equal(0);
	});

	it('redelegate OK', async () => {

		//INFO: need two validators but starport serve support only one validator.
		const validatorList = (await firma.Staking.getValidatorList()).dataList;

		if (validatorList.length < 2)
			return;

		const srcValoperAddress = validatorList[0].operator_address;
		const dstValoperAddress = validatorList[1].operator_address;

		const amount = 10;

		const result = await firma.Staking.delegate(aliceWallet, srcValoperAddress, amount);
		expect(result.code).to.equal(0);

		// NOTICE: there's a case for use more than 200000 gas here.
		const result1 = await firma.Staking.redelegate(aliceWallet, srcValoperAddress, dstValoperAddress, amount, { gas: 300000, fee: 30000 });
		expect(result1.code).to.equal(0);
	});

	// new case added. if succeed, the dapp needs to prevent zero amount input from users.
	it('staking send Fail - send zero money', async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const amount = 0;

		try {
			const result = await firma.Staking.delegate(aliceWallet, valOperAddress, amount);
			expect(result.code).to.equal(5);
		}
		catch (error) {
			expect(false).to.not.equal(true);
		}		
	});

	it('staking send Fail - send lots of money', async () => {

		const amount = 20000000000000;
		const result = await firma.Staking.delegate(aliceWallet, valOperAddress, amount);
		expect(result.code).to.equal(5);
	});

	// NOTICE: not decide to include firma.js spec
	// This unit test can be run once and can be re-invoked after 24 hours.
	it.skip('editValidator OK', async () => {

		//const inputPercentage = 0.123456; // 12.34% (Only 2 decimal places are allowed.)
		const inputPercentage = 0.098767; // 9.87% (Only 2 decimal places are allowed. 67 is expected to be thrown away.)

		const fixed = 4;
		const count = Math.pow(10, fixed);
		const number = Math.floor(inputPercentage * count) / count;
		const per = number.toFixed(fixed)// fill 0

		const per1 = Number.parseFloat(per) * 10000; // make float to int
		const fianlper = per1.toFixed(0); // drop float 

		const commissionRate = fianlper + "00000000000000"; //bigint 
		const minSelfDelegation = "100000";

		const description = {
			moniker: "firma-node-3(gom)",
			identity: "", // identity defines an optional identity signature (ex. UPort or Keybase).
			website: "https://naver.com",
			securityContact: "yhlee@firmainnovation.com",
			details: "we're now testing to edit validator info"
		};

		const result = await firma.Staking.editValidator(validatorWallet, valOperAddress, description, commissionRate, minSelfDelegation);
		expect(result.code).to.equal(0);
	});
});