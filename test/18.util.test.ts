import { expect } from 'chai';
import { FirmaUtil } from '../sdk/FirmaUtil';

describe('[18. util Test]', () => {

	beforeEach(function() {
	})

	// getHashFromString
	it('getSha1HashFromString test', async () => {

		const contractName = "testContract1234";

		let result = FirmaUtil.getSha1HashFromString(contractName);

		expect(result).to.be.equal("c88753a797d1310b36673e3494005bc7485746b7");
	})

	it('getHashFromString test', async () => {

		const contractName = "testContract1234";

		let result = FirmaUtil.getHashFromString(contractName);

		expect(result).to.be.equal("95e55f6b55ccf6b3988a6f9ee6d9c3c0011ea93a2489e7f05d10cada2613c17f");
	})

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

		const accAddress = "firma1a85hxs97rxsrf0yzdn72vhfu39sa0dwxv90ghy";
		const valoperAddress = "firmavaloper1a85hxs97rxsrf0yzdn72vhfu39sa0dwxjkynh2";

		let result = FirmaUtil.getValOperAddressFromAccAddress(accAddress);
		expect(result).to.be.equal(valoperAddress);
	})

	it('getValConsAddressFromConsensusPubKey test', async () => {

		const consensusPubkey = "InWhZBMP3wKQkwIBCrVqQ+BNoPhV5mTjpwiYHKHCZ/k=";
		const valconsAddress = "firmavalcons1fh73gr3f9df7yc390ykdnmeedetlw5ll3dqwje";

		let result = FirmaUtil.getValConsAddressFromAccAddress(consensusPubkey);

		expect(result).to.be.equal(valconsAddress);
	})

	it('getAccAddressFromValOperAddress test', async () => {

		const accAddress = "firma1a85hxs97rxsrf0yzdn72vhfu39sa0dwxv90ghy";
		const valoperAddress = "firmavaloper1a85hxs97rxsrf0yzdn72vhfu39sa0dwxjkynh2";
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

	it('cutting the ufct decimal point test', async () => {

		const decimal = 6;
		
		const testUTokenValue = 533.827284;
		const testUTokenValueStr = "533.827284";

		const testTokenValueStr = "0.000533";

		expect(FirmaUtil.getTokenStringFromUTokenStr(testUTokenValueStr, decimal)).to.be.equal(testTokenValueStr);
		expect(FirmaUtil.getTokenStringFromUToken(testUTokenValue, decimal)).to.be.equal(testTokenValueStr);
	})


	it('cutting the decimal point test', async () => {

		const decimal = 6;
		
		const testTokenValue = 533.827284;
		const testTokenValueStr = "533.827284";
		const testUTokenValue = 533827284;
		const testUTokenValueStr = "533827284";

		expect(FirmaUtil.getUTokenFromToken(testTokenValue, decimal)).to.be.equal(testUTokenValue);
		expect(FirmaUtil.getUTokenStringFromTokenStr(testTokenValueStr, decimal)).to.be.equal(testUTokenValueStr);

		expect(FirmaUtil.getTokenStringFromUTokenStr(testUTokenValueStr, decimal)).to.be.equal(testTokenValueStr);
		expect(FirmaUtil.getTokenStringFromUToken(testUTokenValue, decimal)).to.be.equal(testTokenValueStr);
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

		let hash = FirmaUtil.getFileHashFromBuffer(buffer);

		// hash from sha256 online
		expect(hash).to.be.equal("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
	})

	it('parseDurationString test', async () => {

		const testString = "1800s";
		const duration = FirmaUtil.parseDurationString(testString);

		// Correct way to test object properties
		expect(duration.seconds).to.be.equal(BigInt(1800));
		expect(duration.nanos).to.be.equal(0);
	})

	it('createDurationFromString test', async () => {
		
		const testString = "1800s";
		const duration = FirmaUtil.createDurationFromString(testString);

		expect(duration.seconds).to.be.equal(BigInt(1800));
		expect(duration.nanos).to.be.equal(0);
	})

	it.only('processCommissionRateAsDecimal test - success case', async () => {

		let result = FirmaUtil.processCommissionRateAsDecimal("0.000000000000000000");
		expect(result).to.equal("0");

		result = FirmaUtil.processCommissionRateAsDecimal("1");
		expect(result).to.equal("1000000000000000000");

		result = FirmaUtil.processCommissionRateAsDecimal("1.00000000000000000001");
		expect(result).to.equal("1000000000000000000");

		result = FirmaUtil.processCommissionRateAsDecimal("0.3719281729181018373290120300000831");
		expect(result).to.equal("371928172918101837");

		result = FirmaUtil.processCommissionRateAsDecimal("1.000000000000000000");
		expect(result).to.equal("1000000000000000000");

		result = FirmaUtil.processCommissionRateAsDecimal(" 0.75 ");
		expect(result).to.equal("750000000000000000");

		result = FirmaUtil.processCommissionRateAsDecimal(".23");
		expect(result).to.equal("230000000000000000");

		result = FirmaUtil.processCommissionRateAsDecimal(".9999990000000");
		expect(result).to.equal("999999000000000000");
	})

	it.only('processCommissionRateAsDecimal test - failure cases', async () => {

		expect(() => FirmaUtil.processCommissionRateAsDecimal(".")).to.throw("Invalid commission rate format: .");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("")).to.throw("Invalid commission rate format: ");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("   ")).to.throw("Invalid commission rate format: ");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("null")).to.throw("Invalid commission rate format: null");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("0.1abc")).to.throw("Invalid commission rate format: 0.1abc");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("0.1.2")).to.throw("Invalid commission rate format");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("--0.5")).to.throw("Invalid commission rate format");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("1.01")).to.throw("Invalid commission rate format");
		
		expect(() => FirmaUtil.processCommissionRateAsDecimal("2")).to.throw("Invalid commission rate format");
		
		expect(() => FirmaUtil.processCommissionRateAsDecimal("1.1")).to.throw("Invalid commission rate format");
		
		expect(() => FirmaUtil.processCommissionRateAsDecimal("-0.1")).to.throw("Invalid commission rate format");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("-1")).to.throw("Invalid commission rate format");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("-0.01")).to.throw("Invalid commission rate format: -0.01");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("-0.000000000000000001")).to.throw("Invalid commission rate format");

		expect(() => FirmaUtil.processCommissionRateAsDecimal("0.5%")).to.throw("Invalid commission rate format");
		
		expect(() => FirmaUtil.processCommissionRateAsDecimal(" 0.5 extra")).to.throw("Invalid commission rate format");
	})
});