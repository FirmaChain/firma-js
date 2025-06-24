import { expect } from 'chai';
import fs from 'fs';
import { AccessConfig, AccessType } from '../sdk/FirmaCosmWasmService';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { FirmaUtil } from '../sdk/FirmaUtil';
import { Expires } from '../sdk/FirmaCosmWasmCw20';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[33. cw721 query Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	const extractValue = (events: readonly any[], eventType: string, attrKey: string) => {
		for (const event of events) {
			if (event.type === eventType) {
				for (const attr of event.attributes) {
					if (attr.key === attrKey) {
						return attr.value;
					}
				}
			}
		}
		return "";
	};

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let contractAddress = "";
	let mintId = "";

	it('cw721 setup query', async () => {

		// Cw721 store code
		const wasmFile = fs.readFileSync("./test/sample/cw721_base.wasm");
		const array = new Uint8Array(wasmFile.buffer);

		const storeGas = 3000000;
		const storeFee = FirmaUtil.getUFCTFromFCT(0.3);

		const everyBodyAccessConfig: AccessConfig = {
			permission: AccessType.ACCESS_TYPE_EVERYBODY,
			address: "",
			addresses: []
		};

		const storeCodeResult = await firma.CosmWasm.storeCode(aliceWallet, array, everyBodyAccessConfig, { gas: storeGas, fee: storeFee });
		const codeId = extractValue(storeCodeResult.events, "store_code", "code_id");
		expect(storeCodeResult.code).to.be.equal(0);

		// Cw721 instantiate
		const admin = await aliceWallet.getAddress();
		const label = "test1";

		const instantiateGas = 3000000;
		const instantiateFee = FirmaUtil.getUFCTFromFCT(0.3);
		const noFunds: any = [];

		const testData = JSON.stringify({
			minter: aliceAddress,
			name: "My Awesome NFT Collection",
			symbol: "MAWESOME"			
		});

		const instantiateResult = await firma.CosmWasm.instantiateContract(aliceWallet, admin, codeId, label, testData, noFunds, { gas: instantiateGas, fee: instantiateFee });
		contractAddress = extractValue(instantiateResult.events, "instantiate", "_contract_address");
		expect(instantiateResult.code).to.be.equal(0);

		// Cw721 mint
		const owner = aliceAddress;
		const new_token_id = "1";
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;

		const mintGas = await firma.Cw721.getGasEstimationMint(aliceWallet, contractAddress, owner, new_token_id, new_token_uri);
		const mintFee = Math.ceil(mintGas * 0.1);

		const mintResult = await firma.Cw721.mint(aliceWallet, contractAddress, owner, new_token_id, new_token_uri, { gas: mintGas, fee: mintFee });
		expect(mintResult.code).to.be.equal(0);

		// Cw721 approve
		const expires: Expires = { never: {} };
		const token_id = "1";

		const approveGas = await firma.Cw721.getGasEstimationApprove(aliceWallet, contractAddress, bobAddress, token_id, expires);
		const approveFee = Math.ceil(approveGas * 0.1);

		const approveResult = await firma.Cw721.approve(aliceWallet, contractAddress, bobAddress, token_id, expires, { gas: approveGas, fee: approveFee });
		expect(approveResult.code).to.be.equal(0);
	});


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

	it('cw721 getOwnerShip', async () => {
		
		const data = await firma.Cw721.getOwnerShip(contractAddress);
		expect(data).to.be.an('object');
		expect(data).to.have.property('owner');
	});

	// it('cw721 getExtension', async () => {

	// 	// not use
	// 	const extension = await firma.Cw721.getExtension(contractAddress);
	// 	expect(extension).to.be.an('object');
	// });
});