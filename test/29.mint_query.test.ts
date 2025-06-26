import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[29. Mint Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('Mint getInflation()', async () => {

		const result = await firma.Mint.getInflation();
		expect(Number(result)).to.be.greaterThan(0);
	});
});