import { expect } from 'chai';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaConfig } from "../sdk/FirmaConfig"

describe('[Gas Estimation Test]', () => {

	const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
	const targetMnemonic = "burst torch enemy quick crime slogan trust wood hamster way armor visual common language close park leg ill ball board couch nose theory must";

	const firma = new FirmaSDK(FirmaConfig.LocalDevNetConfig);;

	it('bank send gas estimation', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(targetMnemonic);
		const amount = 1;

		var gas_estimated = await firma.Bank.getGasEstimationSend(wallet, await targetWallet.getAddress(), amount);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("send estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	// getGasEstimationFromUnSignedTxList

	it('Contract addContractLog getGasEstimationFromUnSignedTxList gas estimation', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let contractHash = "0xsalkdjfasldkjf2";
		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CreateContract";
		let ownerAddress = await wallet.getAddress();
		let jsonString = "{}";

		var tx1 = await firma.Contract.getUnsignedTxAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		var gas_estimated = await firma.Contract.getGasEstimationFromUnSignedTxList(wallet, [tx1, tx1, tx1, tx1, tx1]);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("addContractLog estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	it('Contract addContractLog gas estimation', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let contractHash = "0xsalkdjfasldkjf2";
		let timeStamp = Math.round(+new Date() / 1000);;
		let eventName = "CreateContract";
		let ownerAddress = await wallet.getAddress();
		let jsonString = "{}";

		var gas_estimated = await firma.Contract.getGasEstimationAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("addContractLog estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	it('Contract createContractFile gas estimation', async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		let timeStamp = Math.round(+new Date() / 1000);
		let fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random time

		let ownerAddress = await wallet.getAddress();
		let ownerList = [ownerAddress, ownerAddress];
		let jsonString = "{}";

		var gas_estimated = await firma.Contract.getGasEstimationCreateContractFile(wallet, fileHash, timeStamp, ownerList, jsonString);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("createContractFile estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	it('NFT Mint gas estimation', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var gas_estimated = await firma.Nft.getGasEstimationMint(wallet, "https://naver.com");

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("Mint estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	it('NFT Transfer gas estimation', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		let targetWallet = await firma.Wallet.fromMnemonic(targetMnemonic);

		var result = await firma.Nft.mint(wallet, "https://naver.com");

		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		var gas_estimated = await firma.Nft.getGasEstimationTransfer(wallet, await targetWallet.getAddress(), nftId);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("Transfer estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});

	it('NFT Burn gas estimation', async () => {

		let wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		let gas_estimated = await firma.Nft.getGasEstimationBurn(wallet, nftId);

		var multiplier = 1.2;

		let targetGas = Math.ceil(gas_estimated * multiplier);
		var fee = Math.ceil(targetGas * 0.01); // 3.2 -> 4

		//console.log("Burn estimateGas: " + gas_estimated);
		//console.log("multiplier: " + multiplier);
		//console.log("targetGas: " + targetGas);
		//console.log("fee: " + fee + " ufct");
	});
});