import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

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

	let contractAddress = "";

	it('cw721 getOwnerFromNftID', async () => {

		const tokenId = "1";
		const owner = await firma.Cw721.getOwnerFromNftID(contractAddress, tokenId);
	});

	it('cw721 approval', async () => {

		// NOTICE:
		// If spender is different, api call occurs error.
		// So, I have to decide wrap error case on internal functions.

		// A point in time in nanosecond precision
		const tokenId = "1";
		
		const isIncludeExpired = true;
		const approval = await firma.Cw721.getApproval(contractAddress, tokenId, bobAddress, isIncludeExpired);
	});

	it('cw721 approvals', async () => {

		const tokenId = "1";
		const isIncludeExpired = true;
		const approvals = await firma.Cw721.getApprovals(contractAddress, tokenId, isIncludeExpired);

		/* How to using approvals
		for (let i = 0; i < approvals.length; i++) {
			const approval = approvals[i];
			const expires = approval.expires;
		}
		*/
	});

	it('cw721 getAllOperators', async () => {

		// operator : approve all user info
		const isIncludeExpired = false;
		const operators = await firma.Cw721.getAllOperators(contractAddress, aliceAddress, isIncludeExpired);
	});

	it('cw721 getTotalNfts', async () => {

		const total = await firma.Cw721.getTotalNfts(contractAddress);
	});

	it('cw721 getContractInfo', async () => {

		const contractInfo = await firma.Cw721.getContractInfo(contractAddress);
	});

	it('cw721 getNftTokenUri', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftTokenUri(contractAddress, tokenId);
	});

	it('cw721 getNftData', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftData(contractAddress, tokenId);
	});

	it('cw721 getNFTIdListOfOwner', async () => {

		const nftIdList = await firma.Cw721.getNFTIdListOfOwner(contractAddress, aliceAddress);
	});

	it('cw721 getAllNftIdList', async () => {

		const nftIdList = await firma.Cw721.getAllNftIdList(contractAddress);
	});

	it('cw721 getMinter', async () => {

		const minter = await firma.Cw721.getMinter(contractAddress);
	});

	it('cw721 getExtension', async () => {

		// not use
		const extension = await firma.Cw721.getExtension(contractAddress);
	});

	it('cw721 getOwnerShip', async () => {

		const data = await firma.Cw721.getOwnerShip(contractAddress);
	});
});