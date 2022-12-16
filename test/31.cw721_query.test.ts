import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[31. cw721 query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);
	})

	let contractAddress = "firma17uh2wj875vt64x7pzzy08slsl5pqupfln0vw2k79knfshygy6ausxth5d2";

	it('cw721 getOwnerFromNftID', async () => {

		const tokenId = "1";
		const owner = await firma.Cw721.getOwnerFromNftID(contractAddress, tokenId);
		//console.log(owner);
	});

	it('cw721 approval', async () => {

		// NOTICE:
		// If spender is different, api call occurs error.
		// So, I have to decide wrap error case on internal functions.

		// A point in time in nanosecond precision
         
		// firma1lkly7qj4w2la2xxlatrtw6wynz8vxkctjlqkch
		// firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr

		const tokenId = "1";
		const spender = "firma1lkly7qj4w2la2xxlatrtw6wynz8vxkctjlqkch";
		const isIncludeExpired = true;
		const approval = await firma.Cw721.getApproval(contractAddress, tokenId, spender, isIncludeExpired);

		//console.log(approval.spender);
		//console.log(approval.expires);

		const expires = approval.expires;

		if (expires.never != null) {
			//console.log(expires.never);
		}
		if (expires.at_height != null) {
			//console.log(expires.at_height);
		}
		if (expires.at_time != null) {
			//console.log(expires.at_time);
		}
		
	});

	it('cw721 approvals', async () => {

		const tokenId = "1";
		const isIncludeExpired = true;
		const approvals = await firma.Cw721.getApprovals(contractAddress, tokenId, isIncludeExpired);

		//console.log(approvals);

		for (let i = 0; i < approvals.length; i++) {
			const approval = approvals[i];
			const expires = approval.expires;

			//console.log(approval.spender);

			if (expires.never != null) {
				//console.log(expires.never);
			}
			if (expires.at_height != null) {
				//console.log(expires.at_height);
			}
			if (expires.at_time != null) {
				//console.log(expires.at_time);
			}
		}
	});

	it('cw721 getAllOperators', async () => {

		// operator : approve all user info
		const owner = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";
		const isIncludeExpired = false;
		const operators = await firma.Cw721.getAllOperators(contractAddress, owner, isIncludeExpired);
		
		//console.log(operators);
	});

	it('cw721 getTotalNfts', async () => {

		const total = await firma.Cw721.getTotalNfts(contractAddress);
		//console.log(total);
	});

	it('cw721 getContractInfo', async () => {

		const contractInfo = await firma.Cw721.getContractInfo(contractAddress);
		
		//console.log(contractInfo.name);
		//console.log(contractInfo.symbol);
	});

	it('cw721 getNftTokenUri', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftTokenUri(contractAddress, tokenId);
		//console.log(nftInfo);
	});

	it('cw721 getNftData', async () => {

		const tokenId = "1";
		const nftInfo = await firma.Cw721.getNftData(contractAddress, tokenId);

		//console.log(nftInfo.access.owner);
		//console.log(nftInfo.access.approvals);
		//console.log(nftInfo.info.token_uri);
		//console.log(nftInfo.info.extension);
	});

	it('cw721 getNFTIdListOfOwner', async () => {

		const owner = "firma13hcgnwfpe99htsr92v2keqsgx909rhkwfnxgwr";

		const nftIdList = await firma.Cw721.getNFTIdListOfOwner(contractAddress, owner);
		//console.log(nftIdList);
	});

	it('cw721 getAllNftIdList', async () => {

		const nftIdList = await firma.Cw721.getAllNftIdList(contractAddress);
		//console.log(nftIdList);
	});

	it('cw721 getMinter', async () => {

		const minter = await firma.Cw721.getMinter(contractAddress);
		//console.log(minter);
	});

	it('cw721 getExtension', async () => {

		const extension = await firma.Cw721.getExtension(contractAddress);
		//console.log(extension);
	});
});