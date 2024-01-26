import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";

describe('[34. Bridge tx Test]', () => {

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

	let cw721ContractAddress = "firma1mp3dl27wwhdkhkyed5d4ypaq7h5dewazqkqhny98sxcy2cpu23ls369adt";
	let bridgeContractAddress = "firma1ksvlfex49desf4c452j6dewdjs6c48nafemetuwjyj6yexd7x3wqdknay4"
	let codeId = "";

	it.skip('Cw bridge mint temp', async () => {

		// [ 15,16,17,18,19,20 ]

		const owner = aliceAddress;
		const new_token_id = "20";
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

	}),

	it.skip('Cw bridge lock', async () => {

		const token_id = "14";

		const gas = await firma.CwBridge.getGasEstimationLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.lock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('cw bridge lock bulk', async () => {

		const token_id1 = "15";
		const token_id2 = "16";

		const tx1 = await firma.CwBridge.getUnsignedTxLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxLock(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, aliceAddress);
		console.log(data);
	});

	it.skip('Cw bridge unlock', async () => {

		const token_id = "14";

		const gas = await firma.CwBridge.getGasEstimationUnlock(aliceWallet, bridgeContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.unlock(aliceWallet, bridgeContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw bridge unlock bulk', async () => {

		const token_id1 = "2";
		const token_id2 = "3";

		const tx1 = await firma.CwBridge.getUnsignedTxUnlock(bobWallet, bridgeContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxUnlock(bobWallet, bridgeContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(bobWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.signAndBroadcast(bobWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(data);
	});

	it.skip('Cw bridge deposit', async () => {

		const token_id = "14";

		const gas = await firma.CwBridge.getGasEstimationDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, bobAddress);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.deposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id, bobAddress, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
		
	});

	it.skip('Cw bridge deposit bulk', async () => {

		const token_id1 = "17";
		const token_id2 = "18";

		const tx1 = await firma.CwBridge.getUnsignedTxDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id1, bobAddress);
		const tx2 = await firma.CwBridge.getUnsignedTxDeposit(aliceWallet, bridgeContractAddress, cw721ContractAddress, token_id2, bobAddress);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(aliceWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.signAndBroadcast(aliceWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(data);
	});

	it.skip('Cw bridge withdraw', async () => {

		const token_id = "14";

		const gas = await firma.CwBridge.getGasEstimationWithdraw(bobWallet, bridgeContractAddress, token_id);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.withdraw(bobWallet, bridgeContractAddress, token_id, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('Cw bridge withdraw bulk', async () => {

		const token_id1 = "8";
		const token_id2 = "9";

		const tx1 = await firma.CwBridge.getUnsignedTxWithdraw(bobWallet, bridgeContractAddress, token_id1);
		const tx2 = await firma.CwBridge.getUnsignedTxWithdraw(bobWallet, bridgeContractAddress, token_id2);

		const gas = await firma.CwBridge.getGasEstimationSignAndBroadcast(bobWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.CwBridge.signAndBroadcast(bobWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(data);
	});
});