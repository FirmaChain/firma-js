import { expect } from 'chai';
import { FirmaUtil } from '..';

describe('[18. util Test]', () => {

	it('isValidAddress test', async () => {

		const validAddress = "firma134pp6s2nv7pl4mxu58aeufdd6fv5s2zujrrmsa";
		const wrongAddress1 = "firma134pp6s2nv7pl4mxu58aeufdd6fv5s2zujrrmsb";
		const wrongAddress2 = "firma134pp6s2nv7pl4mxu58aeufdd6fv5s2zujrrmsa1";

		let result = FirmaUtil.isValidAddress(validAddress);
		expect(result).to.be.equal(true);

		result = FirmaUtil.isValidAddress(wrongAddress1);
		expect(result).to.be.equal(false);

		result = FirmaUtil.isValidAddress(wrongAddress2);
		expect(result).to.be.equal(false);
	})

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


	it('getTokenFromUTokenString test', async () => {

		const decimal = 6;

		let amountUToken = 1000000;
		let token = FirmaUtil.getTokenStringFromUToken(amountUToken, decimal);

		expect(token).to.be.equal("1");

		amountUToken = 1234000;
		token = FirmaUtil.getTokenStringFromUToken(amountUToken, decimal);

		expect(token).to.be.equal("1.234");
	})

	it('getUTokenStringFromToken test', async () => {

		const decimal = 6;

		let amountUToken = 1;
		let token = FirmaUtil.getUTokenStringFromToken(amountUToken, decimal);

		expect(token).to.be.equal("1000000");

		amountUToken = 1.23;
		token = FirmaUtil.getUTokenStringFromToken(amountUToken, decimal);

		expect(token).to.be.equal("1230000");
	})

	it('getTokenFromUTokenString test', async () => {

		const decimal = 6;

		let amountUToken = "1000000";
		let token = FirmaUtil.getTokenStringFromUTokenStr(amountUToken, decimal);

		expect(token).to.be.equal("1");

		amountUToken = "1234000";
		token = FirmaUtil.getTokenStringFromUTokenStr(amountUToken, decimal);

		expect(token).to.be.equal("1.234");
	})

	it('getUTokenStringFromToken test', async () => {

		const decimal = 6;

		let amountUToken = "1";
		let token = FirmaUtil.getUTokenStringFromTokenStr(amountUToken, decimal);

		expect(token).to.be.equal("1000000");

		amountUToken = "1.23";
		token = FirmaUtil.getUFCTStringFromFCTStr(amountUToken);

		expect(token).to.be.equal("1230000");
	})

	it('getFileHashFromBuffer test', async () => {

		let testString = "hello world";
		let enc = new TextEncoder();
		let buffer = enc.encode(testString);

		let hash = await FirmaUtil.getFileHashFromBuffer(buffer);

		// hash from sha256 online
		expect(hash).to.be.equal("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
	})
});