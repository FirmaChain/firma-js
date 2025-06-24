import { expect } from 'chai';
import { FirmaConfig } from '../sdk/FirmaConfig';
import { FirmaSDK } from '../sdk/FirmaSDK'
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { aliceMnemonic, bobMnemonic } from './config_test';

describe('[37. Marketplace tx Test]', () => {

	let firma: FirmaSDK;

	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;

	beforeEach(async function () {
		firma = new FirmaSDK(FirmaConfig.TestNetConfig);

		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		aliceAddress = await aliceWallet.getAddress();
		bobAddress = await bobWallet.getAddress();
	})

	let cw721ContractAddress = "";
	let cw20ContractAddress = "";
	let marketplaceContractAddress = "";
	
	it('Cw nft mint & register fct and purchase same user (fail)', async () => {

		const new_token_id = "44";
		const fctAmount = 1;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE FCT
		console.log("2. REGISTER SALE FCT");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);
		
		// 4. PURCHASE SALE FCT
		console.log("4. PURCHASE SALE FCT");
		let bobFCTBalance = await firma.Bank.getBalance(bobAddress);
		console.log(bobFCTBalance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleFCT(aliceWallet, marketplaceContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.purchaseSaleFCT(aliceWallet, marketplaceContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

	}),


	it('Cw nft mint & register cw20 and purchase same user (fail)', async () => {

		const new_token_id = "42";
		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE CW20");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. PURCHASE SALE CW20
		console.log("4. PURCHASE SALE CW20");
		let bobCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, bobAddress);
		console.log(bobCw20Balance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleCw20(aliceWallet, marketplaceContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.purchaseSaleCw20(aliceWallet, marketplaceContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

	}),


	it('Cw nft mint & register fct and other users cancel (fail)', async () => {

		const new_token_id = "41";

		const fctAmount = 1.2;

		// 1. NFT MINT
		console.log("1. NFT MINT");

		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE FCT");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.registerSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
		
		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");

		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. CANCEL SALE
		console.log("4. CANCEL SALE");

		gas = await firma.CwMarketplace.getGasEstimationCancelSale(bobWallet, marketplaceContractAddress, new_token_id);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.cancelSale(bobWallet, marketplaceContractAddress, new_token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const registerList2 = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList2);
		
	}),


	it('Cw nft mint & register cw20 and other users cancel (fail)', async () => {

		const new_token_id = "40";

		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		// 1. NFT MINT
		console.log("1. NFT MINT");

		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE CW20");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");

		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. CANCEL SALE
		console.log("4. CANCEL SALE");

		gas = await firma.CwMarketplace.getGasEstimationCancelSale(bobWallet, marketplaceContractAddress, new_token_id);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.cancelSale(bobWallet, marketplaceContractAddress, new_token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const registerList2 = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList2);
		
	}),

	it('Cw nft mint & register cw20 and cancel', async () => {

		const new_token_id = "39";

		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		// 1. NFT MINT
		console.log("1. NFT MINT");

		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE CW20");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");

		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. CANCEL SALE
		console.log("4. CANCEL SALE");

		gas = await firma.CwMarketplace.getGasEstimationCancelSale(aliceWallet, marketplaceContractAddress, new_token_id);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.cancelSale(aliceWallet, marketplaceContractAddress, new_token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const registerList2 = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList2);
		
	}),

	it('Cw nft mint & register cw20 and try to purchase fct (fail)', async () => {
		
		const new_token_id = "36";
		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE CW20");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. PURCHASE SALE FCT
		console.log("4. PURCHASE SALE FCT");
		let bobFCTBalance = await firma.Bank.getBalance(bobAddress);
		console.log(bobFCTBalance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleFCT(bobWallet, marketplaceContractAddress, new_token_id, cw20Amount);

		// Invalid sale type

	}),

	it('Cw nft mint & register fct and try to purchase cw20 (fail)', async () => {

		const new_token_id = "37";
		const fctAmount = 1;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE FCT
		console.log("2. REGISTER SALE FCT");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. PURCHASE SALE CW20
		console.log("4. PURCHASE SALE CW20");
		let bobCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, bobAddress);
		console.log(bobCw20Balance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleCw20(bobWallet, marketplaceContractAddress, new_token_id, cw20ContractAddress, fctAmount, 0);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		// error: Invalid sale type

	}),

	it('Cw nft mint & register & purchase CW20', async () => {
		
		const new_token_id = "34";
		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE CW20
		console.log("2. REGISTER SALE CW20");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);

		// 4. PURCHASE SALE CW20
		console.log("4. PURCHASE SALE CW20");
		let bobCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, bobAddress);
		console.log(bobCw20Balance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleCw20(bobWallet, marketplaceContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		fee = Math.ceil(gas * 0.1);

		result = await firma.CwMarketplace.purchaseSaleCw20(bobWallet, marketplaceContractAddress, new_token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 5. NFT OWNER CHECK
		console.log("5. NFT OWNER CHECK");
		const nftList = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(nftList);

		// 6. BALANCE CHECK
		console.log("6. BALANCE CHECK");
		bobCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, bobAddress);
		console.log(bobCw20Balance);
	}),

	it('Cw nft mint & register & purchase FCT', async () => {

		const new_token_id = "33";
		const fctAmount = 1;

		// 1. NFT MINT
		console.log("1. NFT MINT");
		
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;
		const owner = aliceAddress;
		
		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 2. REGISTER SALE FCT
		console.log("2. REGISTER SALE FCT");
		gas = await firma.CwMarketplace.getGasEstimationRegisterSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.registerSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 3. GET SALE INFO
		console.log("3. GET SALE INFO");
		const sale_info = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(sale_info);

		const registerList = await firma.CwMarketplace.getRegisterListByAddress(marketplaceContractAddress, aliceAddress);
		console.log(registerList);
		
		// 4. PURCHASE SALE FCT
		console.log("4. PURCHASE SALE FCT");
		let bobFCTBalance = await firma.Bank.getBalance(bobAddress);
		console.log(bobFCTBalance);

		gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleFCT(bobWallet, marketplaceContractAddress, new_token_id, fctAmount);
		fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		result = await firma.CwMarketplace.purchaseSaleFCT(bobWallet, marketplaceContractAddress, new_token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		// 5. NFT OWNER CHECK
		console.log("5. NFT OWNER CHECK");
		const nftList = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(nftList);

		// 6. BALANCE CHECK
		console.log("6. BALANCE CHECK");
		bobFCTBalance = await firma.Bank.getBalance(bobAddress);
		console.log(bobFCTBalance);

	}),

	it('Cw nft mint temp', async () => {

		// [ 15,16,17,18,19,20 ]

		const owner = aliceAddress;
		const new_token_id = "31";
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

	}),

	it('Cw marketplace get config', async () => {
        const data = await firma.CwMarketplace.getConfig(marketplaceContractAddress);
		console.log(data);
	}),

	it('Cw marketplace get register list', async () => {

		const data = await firma.CwMarketplace.getRegisterList(marketplaceContractAddress);
		console.log(data);
	}),

	it	('Cw marketplace register sale FCT', async () => {

		const token_id = "29";
		const fctAmount = 1;

		const gas = await firma.CwMarketplace.getGasEstimationRegisterSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, token_id, fctAmount);
		const fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		var result = await firma.CwMarketplace.registerSaleFCT(aliceWallet, marketplaceContractAddress, cw721ContractAddress, token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const contractFCTBalance = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, marketplaceContractAddress);
		console.log(contractFCTBalance);

	}),

	it('Cw marketplace register sale cw20', async () => {

		const token_id = "31";
		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		const gas = await firma.CwMarketplace.getGasEstimationRegisterSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		const fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		var result = await firma.CwMarketplace.registerSaleCw20(aliceWallet, marketplaceContractAddress, cw721ContractAddress, token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const contractNFTBalance = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, marketplaceContractAddress);
		console.log(contractNFTBalance);

	}),

	it('Cw marketplace purchase sale FCT', async () => {

		const contractBalance = await firma.Bank.getBalance(marketplaceContractAddress);
		console.log(contractBalance);

		const token_id = "37";
		const fctAmount = 1;

		const gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleFCT(aliceWallet, marketplaceContractAddress, token_id, fctAmount);
		const fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		var result = await firma.CwMarketplace.purchaseSaleFCT(aliceWallet, marketplaceContractAddress, token_id, fctAmount, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const nftBalance = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, marketplaceContractAddress);
		console.log(nftBalance);

		const contractFCTBalance = await firma.Bank.getBalance(marketplaceContractAddress);
		console.log(contractFCTBalance);
	}),

	it('Cw marketplace purchase sale Cw20', async () => {

		const token_id = "31";
		const cw20Amount = 1.2;
		const cw20Decimal = 6;

		const aliceCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, aliceAddress);
		console.log(aliceCw20Balance);

		const gas = await firma.CwMarketplace.getGasEstimationPurchaseSaleCw20(aliceWallet, marketplaceContractAddress, token_id, cw20ContractAddress, cw20Amount, cw20Decimal);
		const fee = Math.ceil(gas * 0.1);
		console.log(gas, fee);

		var result = await firma.CwMarketplace.purchaseSaleCw20(aliceWallet, marketplaceContractAddress, token_id, cw20ContractAddress, cw20Amount, cw20Decimal, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const contractCw20Balance = await firma.Cw20.getBalance(cw20ContractAddress, marketplaceContractAddress);
		console.log(contractCw20Balance);
		
	}),

	it('Cw marketplace chage_owner', async () => {
		
		const new_owner = aliceAddress;

		const gas = await firma.CwMarketplace.getGasEstimationChangeOwner(bobWallet, marketplaceContractAddress, new_owner);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwMarketplace.changeOwner(bobWallet, marketplaceContractAddress, new_owner, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.CwMarketplace.getOwner(marketplaceContractAddress);
		console.log(data);
	})
})
