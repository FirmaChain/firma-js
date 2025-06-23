import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[31. cw20 query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	const contractAddress = "";

	it('Cw20 getBalance', async () => {

		const balance = await firma.Cw20.getBalance(contractAddress, aliceAddress);
		expect(balance).to.be.a('string');
		expect(Number(balance)).to.be.at.least(0);
	});

	it('Cw20 getBalance - no balance', async () => {

		const nobalance_address = "firma1d84pmnumnsh80v74lta0vnpd476ncp4pjnuklr";
		const balance = await firma.Cw20.getBalance(contractAddress, nobalance_address);
		expect(balance).to.be.a('string');
		expect(Number(balance)).to.equal(0);
	});

	it('Cw20 getTotalSupply', async () => {

		const totalSupply = await firma.Cw20.getTotalSupply(contractAddress);
		expect(totalSupply).to.be.a('string');
		expect(Number(totalSupply)).to.be.at.least(0);
	});

	it('Cw20 getTokenInfo', async () => {

		const tokenInfo = await firma.Cw20.getTokenInfo(contractAddress);
		expect(tokenInfo).to.be.an('object');
		expect(tokenInfo).to.have.property('name');
		expect(tokenInfo).to.have.property('symbol');
		expect(tokenInfo).to.have.property('decimals');
		expect(tokenInfo).to.have.property('total_supply');
	});

	it('Cw20 getMinter', async () => {

		const minter = await firma.Cw20.getMinter(contractAddress);
		expect(minter).to.be.an('object');
		expect(minter).to.have.property('minter');
	});

	it('Cw20 getAllowance', async () => {

		const info = await firma.Cw20.getAllowance(contractAddress, aliceAddress, bobAddress);
		expect(info).to.be.an('object');
		expect(info).to.have.property('allowance');
		expect(info).to.have.property('expires');
	});

	it('Cw20 getAllAllowances', async () => {

		const info = await firma.Cw20.getAllAllowances(contractAddress, aliceAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getAllSpenderAllowances', async () => {
		const info = await firma.Cw20.getAllSpenderAllowances(contractAddress, bobAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getAllAccounts', async () => {

		const info = await firma.Cw20.getAllAccounts(contractAddress);
		expect(info).to.be.an('array');
	});

	it('Cw20 getMarketingInfo', async () => {

		const info = await firma.Cw20.getMarketingInfo(contractAddress);
		expect(info).to.be.an('object');
	});

	it.skip('Cw20 getDownloadLogo', async () => {

		// INFO: Errors if no logo data is stored for this contract.
		try {
			const info = await firma.Cw20.getDownloadLogo(contractAddress);
		} catch (error) {
			expect(false).to.not.equal(true);
			console.log(error);
		}
	});
});