import { AccessConfig, AccessType } from "../sdk/FirmaCosmWasmService";
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from "../sdk/FirmaUtil";
import { FirmaWalletService } from "../sdk/FirmaWalletService";
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';
import fs from "fs";

describe('[33. cw721 query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobWallet: FirmaWalletService;
	let bobAddress: string;

	let contractAddress = "";
	let codeId = "";
	let tokenId = "1";

	const tokenUri = "https://meta.nft.io/uri";

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();

		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_EVERYBODY, address: "" };
		//const onlyAddressAccessConfig: AccessConfig = { permission: AccessType.ACCESS_TYPE_ONLY_ADDRESS, address: aliceAddress };

		var result = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: instantiateGas, fee: instantiateFee });
		var data = JSON.parse(result.rawLog!);

		codeId = data[0]["events"][1]["attributes"][1]["value"];

		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const gas = 3000000;
		const fee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			minter: aliceAddress,
			name: "My Awesome NFT Collection",
			symbol: "MAWESOME"			
		});

		var result = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: gas, fee: fee });
		var data = JSON.parse(result.rawLog!);
		
		contractAddress = data[0]["events"][0]["attributes"][0]["value"];
	})

	it('cw721 getOwnerFromNftID', async () => {

		const gas = await firma.Cw721.getGasEstimationMint(aliceWallet, contractAddress, aliceAddress, tokenId, `${tokenUri}/${tokenId}`);
		const fee = Math.ceil(gas * 0.1);

		await firma.Cw721.mint(aliceWallet, contractAddress, aliceAddress, tokenId, `${tokenUri}/${tokenId}`, { gas, fee });

		const owner = await firma.Cw721.getOwnerFromNftID(contractAddress, tokenId);
	});

	it('cw721 approval', async () => {

		// NOTICE:
		// If spender is different, api call occurs error.
		// So, I have to decide wrap error case on internal functions.

		// A point in time in nanosecond precision

		const isIncludeExpired = true;
		const approval = await firma.Cw721.getApproval(contractAddress, tokenId, bobAddress, isIncludeExpired);

		//console.log(approval.spender);
		//console.log(approval.expires);
	});

	it('cw721 approvals', async () => {

		const isIncludeExpired = true;
		const approvals = await firma.Cw721.getApprovals(contractAddress, tokenId, isIncludeExpired);

		//console.log(approvals);

		for (let i = 0; i < approvals.length; i++) {
			const approval = approvals[i];
			const expires = approval.expires;

			// console.log(approval.spender);
			// console.log(expires);
		}
	});

	it('cw721 getAllOperators', async () => {

		// operator : approve all user info
		const isIncludeExpired = false;
		const operators = await firma.Cw721.getAllOperators(contractAddress, aliceAddress, isIncludeExpired);
		
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

		const nftInfo = await firma.Cw721.getNftTokenUri(contractAddress, tokenId);

		//console.log(nftInfo);
	});

	it('cw721 getNftData', async () => {

		const nftInfo = await firma.Cw721.getNftData(contractAddress, tokenId);

		//console.log(nftInfo.access.owner);
		//console.log(nftInfo.access.approvals);
		//console.log(nftInfo.info.token_uri);
		//console.log(nftInfo.info.extension);
	});

	it('cw721 getNFTIdListOfOwner', async () => {

		const nftIdList = await firma.Cw721.getNFTIdListOfOwner(contractAddress, aliceAddress);
		// console.log(nftIdList);
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

		// not use
		const extension = await firma.Cw721.getExtension(contractAddress);
		//console.log(extension);
	});

	it('cw721 getOwnerShip', async () => {

		const data = await firma.Cw721.getOwnerShip(contractAddress);
		//console.log(data);
	});
});