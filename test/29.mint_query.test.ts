import { expect } from 'chai';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import Long from 'long';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[29. Mint Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Mint getInflation()', async () => {

		var result = await firma.Mint.getInflation();
		//console.log(result);
		//expect(result).to.be.equal("0");
	});
	
});