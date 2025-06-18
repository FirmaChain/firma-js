import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from "./config_test";

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