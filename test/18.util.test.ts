import { expect } from 'chai';
import { FirmaUtil } from '..';

describe('[18. util Test]', () => {

	it('getValOperAddressFromAccAddress test', async () => {

		const accAddress = "firma134pp6s2nv7pl4mxu58aeufdd6fv5s2zujrrmsa";
		const valoperAddress = "firmavaloper134pp6s2nv7pl4mxu58aeufdd6fv5s2zuvsgqsn";

		let result = FirmaUtil.getValOperAddressFromAccAddress(accAddress);
		expect(result).to.be.equal(valoperAddress);
	})

	it('getAccAddressFromValOperAddress test', async () => {

		const accAddress = "firma134pp6s2nv7pl4mxu58aeufdd6fv5s2zujrrmsa";
		const valoperAddress = "firmavaloper134pp6s2nv7pl4mxu58aeufdd6fv5s2zuvsgqsn";

		let result = FirmaUtil.getAccAddressFromValOperAddress(valoperAddress);
		expect(result).to.be.equal(accAddress);
	})

	it('getFCTFromUFCTString test', async () => {

		let amountUFCT = 1000000;
		let fct = FirmaUtil.getFCTStringFromUFCT(amountUFCT);

		expect(fct).to.be.equal("1");

		amountUFCT = 1234000;
		fct = FirmaUtil.getFCTStringFromUFCT(amountUFCT);

		expect(fct).to.be.equal("1.234");
	})

	it('getUFCTStringFromFCT test', async () => {

		let amountUFCT = 1;
		let fct = FirmaUtil.getUFCTStringFromFCT(amountUFCT);

		expect(fct).to.be.equal("1000000");

		amountUFCT = 1.23;
		fct = FirmaUtil.getUFCTStringFromFCT(amountUFCT);

		expect(fct).to.be.equal("1230000");
	})

	it('getFCTFromUFCTString test', async () => {

		let amountUFCT = "1000000";
		let fct = FirmaUtil.getFCTStringFromUFCTStr(amountUFCT);

		expect(fct).to.be.equal("1");

		amountUFCT = "1234000";
		fct = FirmaUtil.getFCTStringFromUFCTStr(amountUFCT);

		expect(fct).to.be.equal("1.234");
	})

	it('getUFCTStringFromFCT test', async () => {

		let amountUFCT = "1";
		let fct = FirmaUtil.getUFCTStringFromFCTStr(amountUFCT);

		expect(fct).to.be.equal("1000000");

		amountUFCT = "1.23";
		fct = FirmaUtil.getUFCTStringFromFCTStr(amountUFCT);

		expect(fct).to.be.equal("1230000");
	})
});