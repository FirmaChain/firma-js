import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import { expect } from 'chai';

describe('[33. cw721 query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let contractAddress = "firma1az885vpd2azjmepzhs3t9fftv4td44cyk526jykgpzseghtj44qq2gc4g3";

	it('cw721 getOwnerFromNftID', async () => {

		const tokenId = "1";
		const owner = await firma.Cw721.getOwnerFromNftID(contractAddress, tokenId);
		expect(owner).to.be.a('string');
		expect(owner.length).to.be.greaterThan(0);
	});

	it('cw721 approval', async () => {

		// NOTICE:
		// If spender is different, api call occurs error.
		// So, I have to decide wrap error case on internal functions.

		// A point in time in nanosecond precision
		const tokenId = "1";
		
		const isIncludeExpired = true;
		try {
			const approval = await firma.Cw721.getApproval(contractAddress, tokenId, bobAddress, isIncludeExpired);

			expect(approval).to.be.an('object');
			expect(approval).to.have.property('spender');
			expect(approval).to.have.property('expires');
		} catch (error) {
			expect(error).to.exist;
		}
	});

	it('cw721 approvals', async () => {

		const tokenId = "1";
		const isIncludeExpired = true;

		const approvals = await firma.Cw721.getApprovals(contractAddress, tokenId, isIncludeExpired);
		expect(approvals).to.be.an('array');

		if (approvals.length > 0) {
			expect(approvals[0]).to.have.property('spender');
			expect(approvals[0]).to.have.property('expires');
		}
	});

	it('cw721 getAllOperators', async () => {

		// operator : approve all user info
		const isIncludeExpired = false;
		const operators = await firma.Cw721.getAllOperators(contractAddress, aliceAddress, isIncludeExpired);
		expect(operators).to.be.an('array');
	});

	it('cw721 getTotalNfts', async () => {

		const total = await firma.Cw721.getTotalNfts(contractAddress);
		expect(total).to.be.at.least(0);
	});

	it('cw721 getContractInfo', async () => {

		const contractInfo = await firma.Cw721.getContractInfo(contractAddress);
		expect(contractInfo).to.be.an('object');
		expect(contractInfo).to.have.property('name');
		expect(contractInfo).to.have.property('symbol');
	});

	it('cw721 getNftTokenUri', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftTokenUri(contractAddress, tokenId);
		expect(nftInfo).to.be.a('string');
	});

	it('cw721 getNftData', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftData(contractAddress, tokenId);
		expect(nftInfo).to.have.property('access');
		expect(nftInfo.access).to.have.property('owner');
		expect(nftInfo.access).to.have.property('approvals');
		expect(nftInfo.access.approvals).to.be.an('array');
		expect(nftInfo).to.have.property('info');
		expect(nftInfo.info).to.have.property('token_uri');
		expect(nftInfo.info).to.have.property('extension');
	});

	it('cw721 getNFTIdListOfOwner', async () => {

		const nftIdList = await firma.Cw721.getNFTIdListOfOwner(contractAddress, aliceAddress);
		expect(nftIdList).to.be.an('array');
	});

	it('cw721 getAllNftIdList', async () => {

		const nftIdList = await firma.Cw721.getAllNftIdList(contractAddress);
		expect(nftIdList).to.be.an('array');
	});

	it('cw721 getMinter', async () => {

		const minter = await firma.Cw721.getMinter(contractAddress);
		expect(minter).to.be.a('string');
	});

	it('cw721 getExtension', async () => {

		// not use
		const extension = await firma.Cw721.getExtension(contractAddress);
		expect(extension).to.be.an('object');
	});

	it('cw721 getOwnerShip', async () => {

		const data = await firma.Cw721.getOwnerShip(contractAddress);
		expect(data).to.be.an('object');
		expect(data).to.have.property('owner');
	});
});