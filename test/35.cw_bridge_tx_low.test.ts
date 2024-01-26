import { FirmaConfig } from "../sdk/FirmaConfig";
import { FirmaSDK } from "../sdk/FirmaSDK"

import { expect } from 'chai';
import { aliceMnemonic, bobMnemonic } from './config_test';
import { FirmaWalletService } from "../sdk/FirmaWalletService";

describe('[35. Bridge tx low Test]', () => {

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

	// low level test
	//----------------------------------------------------------------------

	it.skip('[low] Cw721 send_nft & lock', async () => {

		const token_id = "6";
		const targetContractAddress = bridgeContractAddress;

		const msg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const gas = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, targetContractAddress, token_id, msg);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, targetContractAddress, token_id, msg, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('[low] cw bridge unlock', async () => {

		const token_id = "1";
		const noFunds: any = [];

		const msgData = JSON.stringify({
			"unlock": {
				token_id,
			}
		});

        const gas = await firma.CosmWasm.getGasEstimationExecuteContract(aliceWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		var result =  await firma.CosmWasm.executeContract(aliceWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('[low] Cw721 send_nft & deposit', async () => {

		const owner = aliceAddress;
		const new_token_id = "6";
		const new_token_uri = "https://meta.nft.io/uri/" + new_token_id;

		let gas = await firma.Cw721.getGasEstimationMint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri);
		let fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.mint(aliceWallet, cw721ContractAddress, owner, new_token_id, new_token_uri, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data1 = await firma.Cw721.getNftData(cw721ContractAddress, new_token_id);
		console.log(data1);

		const targetContractAddress = bridgeContractAddress;

		const msg = {
			action: "deposit",
			target_addr: bobAddress
		}

		let gas1 = await firma.Cw721.getGasEstimationSendNft(aliceWallet, cw721ContractAddress, targetContractAddress, new_token_id, msg);
		let fee1 = Math.ceil(gas1 * 0.1);

		var result = await firma.Cw721.sendNft(aliceWallet, cw721ContractAddress, targetContractAddress, new_token_id, msg, { gas: gas1, fee: fee1 });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, new_token_id);
		console.log(data);
	});

	it.skip('[low] cw bridge withdraw', async () => {

		const token_id = "3";
		const noFunds: any = [];

		const msgData = JSON.stringify({
			"withdraw": {
				token_id,
			}
		});

        const gas = await firma.CosmWasm.getGasEstimationExecuteContract(bobWallet, bridgeContractAddress, msgData, noFunds);
		const fee = Math.ceil(gas * 0.1);

		var result =  await firma.CosmWasm.executeContract(bobWallet, bridgeContractAddress, msgData, noFunds, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNftData(cw721ContractAddress, token_id);
		console.log(data);
	});

	it.skip('[low] cw721 send_nft & bridge lock bulk', async () => {

		const token_id1 = "4";
		const token_id2 = "6";

		const contractMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataLock();

		const tx1 = await firma.Cw721.getUnsignedTxSendNft(bobWallet, cw721ContractAddress, bridgeContractAddress, token_id1, contractMsg);
		const tx2 = await firma.Cw721.getUnsignedTxSendNft(bobWallet, cw721ContractAddress, bridgeContractAddress, token_id2, contractMsg);

		const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(bobWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.signAndBroadcast(bobWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(data);
	});

	it.skip('[low] cw721 send_nft & bridge deposit bulk', async () => {

		const token_id1 = "4";
		const token_id2 = "6";

		const contractMsg = firma.CwBridge.getCwBridgeMsgData().getMsgDataDeposit(bobAddress);

		const tx1 = await firma.Cw721.getUnsignedTxSendNft(bobWallet, cw721ContractAddress, bridgeContractAddress, token_id1, contractMsg);
		const tx2 = await firma.Cw721.getUnsignedTxSendNft(bobWallet, cw721ContractAddress, bridgeContractAddress, token_id2, contractMsg);

		const gas = await firma.Cw721.getGasEstimationSignAndBroadcast(bobWallet, [tx1, tx2]);
		const fee = Math.ceil(gas * 0.1);

		var result = await firma.Cw721.signAndBroadcast(bobWallet, [tx1, tx2], { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);

		const data = await firma.Cw721.getNFTIdListOfOwner(cw721ContractAddress, bobAddress);
		console.log(data);
	});
});