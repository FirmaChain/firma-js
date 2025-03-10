import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, validatorMnemonic, TestChainConfig } from './config_test';
import { VotingOption } from '../sdk/firmachain/common';
import { Timestamp } from "../sdk/firmachain/google/protobuf/timestamp";

describe('[08. Gas Estimation Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it("1-1. bank send gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 1;

		try {
			const gas = await firma.Bank.getGasEstimationSend(wallet, await targetWallet.getAddress(), amount);
			console.log("estimateGas : " + gas);
			
		} catch (error) {
			console.log(error);
		}
	});

	it("1-2. bank sendToken gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const aliceAddress = await aliceWallet.getAddress();
		const bobAddress = await bobWallet.getAddress();

		const timeStamp = Math.round(+new Date() / 1000);
		
		const tokenName = `KOMX TOKEN${timeStamp}`;
		const tokenSymbol = `KOMX${timeStamp}`;
		const tokenID = `ukomx${timeStamp}`;
		const tokenURI = "https://firmachain.org";
		const totalSupply = 100000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;
		const sendAmount = 1;
		
		try {
			await firma.Token.createToken(aliceWallet, tokenName, tokenSymbol, tokenURI, totalSupply, decimal, mintable, burnable);
			const gas = await firma.Bank.getGasEstimationSendToken(aliceWallet, bobAddress, tokenID, sendAmount, decimal);
			console.log("estimateGas : " + gas);
			await firma.Token.burn(aliceWallet, tokenID, totalSupply, decimal);
		} catch (error) {
			console.log(error);
		}
	});

	it("2-1. Contract addContractLog getGasEstimationFromUnSignedTxList gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = await wallet.getAddress();
		const jsonString = "{}";

		const tx1 = await firma.Contract.getUnsignedTxAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		const gas = await firma.Contract.getGasEstimationFromUnSignedTxList(wallet, [tx1, tx1, tx1, tx1, tx1]);

		console.log("estimateGas : " + gas);
	});

	it("2-2. Contract addContractLog gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = await wallet.getAddress();
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		console.log("estimateGas : " + gas);
	});

	it("2-3. Contract createContractFile gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random time

		const ownerAddress = await wallet.getAddress();
		const ownerList = [ownerAddress, ownerAddress];
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationCreateContractFile(wallet, fileHash, timeStamp, ownerList, jsonString);
		console.log("estimateGas : " + gas);
	});

	it("3-1. NFT Mint gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const gas = await firma.Nft.getGasEstimationMint(wallet, "https://naver.com");

		console.log("estimateGas : " + gas);
	});

	it("3-2. NFT Transfer gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const result = await firma.Nft.mint(wallet, "https://naver.com");

		const jsonData = JSON.parse(result.rawLog!);
		const nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		const gas = await firma.Nft.getGasEstimationTransfer(wallet, await targetWallet.getAddress(), nftId);
		console.log("estimateGas : " + gas);
	});

	it("3-3. NFT Burn gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		var result = await firma.Nft.mint(wallet, "https://naver.com");

		var jsonData = JSON.parse(result.rawLog!);
		var nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		const gas = await firma.Nft.getGasEstimationBurn(wallet, nftId);
		console.log("estimateGas : " + gas);
	});

	it("4-1. Feegrant GrantPeriodicAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const spendLimit = 200000;
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 2);

		let periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: 2000,
			periodCanSpend: 10000,
			periodReset: expirationDate
		};

		const gas = await firma.FeeGrant.getGasEstimationGrantPeriodicAllowance(aliceWallet, await bobWallet.getAddress(), periodicAllowanceData);
		console.log("estimateGas : " + gas);
	});

	it("4-2. Feegrant GrantBasicAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		var gas = await firma.FeeGrant.getGasEstimationGrantBasicAllowance(aliceWallet, await bobWallet.getAddress());
		console.log("estimateGas : " + gas);
	});

	it("4-3. Feegrant revokeAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		await firma.FeeGrant.grantBasicAllowance(aliceWallet, await bobWallet.getAddress());
		const gas = await firma.FeeGrant.getGasEstimationRevokeAllowance(aliceWallet, await bobWallet.getAddress());
		await firma.FeeGrant.revokeAllowance(aliceWallet, await bobWallet.getAddress());
		console.log("estimateGas : " + gas);
	});


	// var result = await firma.Staking.delegate(wallet, validatorAddress, amountFCT);
	// var result = await firma.Staking.undelegate(wallet, validatorAddress, amount);
	//let result1 = await firma.Staking.redelegate(wallet, srcValidatorAddress, dstValidatorAddress, amount,{ gas: 300000, fee: 3000 });
	it("5-1. Staking delegate gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amountFCT = 60;

		const gas = await firma.Staking.getGasEstimationDelegate(wallet, validatorAddress, amountFCT);
		console.log("estimateGas : " + gas);
	});

	it("5-2. Staking undelegate gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());

		const amount = 5;

		const gas = await firma.Staking.getGasEstimationUndelegate(wallet, validatorAddress, amount);
		console.log("estimateGas : " + gas);
	});

	it("5-3. Staking redelegate gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorList = (await firma.Staking.getValidatorList()).dataList;

		if (validatorList.length < 2)
			return;

		const srcValidatorAddress = validatorList[0].operator_address;
		const dstValidatorAddress = validatorList[1].operator_address;

		const amount = 10;

		// NOTICE: there's a case for use more than 200000 gas here.

		try {
			const gas = await firma.Staking.getGasEstimationRedelegate(wallet, srcValidatorAddress, dstValidatorAddress, amount,
				{ gas: 300000, fee: 30000 });
	
			console.log("estimateGas : " + gas);
			
		} catch (error) {
			console.log(error);
		}
	});

	it("6-1. Distribution withdrawAllRewards gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const delegationList = (await (await firma.Staking.getTotalDelegationInfo(await wallet.getAddress())).dataList);
		const validatorAddress = delegationList[0].delegation.validator_address;

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewards(wallet, validatorAddress);
		console.log("estimateGas : " + gas);
	});

	it("6-2. Distribution withdrawValidatorCommission gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const gas = await firma.Distribution.getGasEstimationWithdrawValidatorCommission(wallet, validatorAddress);
		console.log("estimateGas : " + gas);
	});

	it("6-3. Distribution fundCommunityPool gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const amount = 1;

		const gas = await firma.Distribution.getGasEstimationFundCommunityPool(wallet, amount);
		console.log("estimateGas : " + gas);
	});

	it("6-4. Distribution setWithdrawAddress gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const gas = await firma.Distribution.getGasEstimationSetWithdrawAddress(aliceWallet, await bobWallet.getAddress());
		console.log("estimateGas : " + gas);
	});

	// var result = await firma.Gov.submitTextProposal(wallet, title, description, initialDepositFCT);
	// var result = await firma.Gov.submitCommunityPoolSpendProposal(aliceWallet, title, description, initialDepositFCT, amount, recipient);
	// var result = await firma.Gov.submitParameterChangeProposal(aliceWallet, title, description, initialDepositFCT, changeParamList);
	// var result = await firma.Gov.submitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight);
	// var result = await firma.Gov.submitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);
	// var result = await firma.Gov.deposit(wallet, proposalId, amount);
	// var result = await firma.Gov.vote(wallet, proposalId, VotingOption.VOTE_OPTION_YES);

	it("7-1. Gov submitTextProposal gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10;
		const title = "test submit proposal";
		const description = "test description";

		var result = await firma.Gov.submitTextProposal(wallet, title, description, initialDepositFCT);

		const gas = await firma.Gov.getGasEstimationSubmitTextProposal(wallet, title, description, initialDepositFCT);
		console.log("estimateGas : " + gas);
	});

	it("7-2. Gov submitCommunityPoolSpendProposal gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const initialDepositFCT = 10;
		const title = "Community spend proposal1";
		const description = "This is a community spend proposal";
		const amount = 1000;
		const recipient = await bobWallet.getAddress();

		const gas = await firma.Gov.getGasEstimationSubmitCommunityPoolSpendProposal(aliceWallet, title, description, initialDepositFCT, amount, recipient);
		console.log("estimateGas : " + gas);
	});

	it("7-3. Gov submitParameterChangeProposal gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10;
		const title = "Parameter Change proposal1";
		const description = "This is a Parameter change proposal";

		const changeParamList = [{
			subspace: "staking",
			key: "MaxValidators",
			value: "100",
		}];

		const gas = await firma.Gov.getGasEstimationSubmitParameterChangeProposal(aliceWallet, title, description, initialDepositFCT, changeParamList);
		console.log("estimateGas : " + gas);
	});

	it("7-4. Gov submitSoftwareUpgradeProposalByHeight gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const upgradeName = "v0.2.7";
		const upgradeHeight = 20000000;

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight);
		console.log("estimateGas : " + gas);
	});

	it("7-5. Gov submitCancelSoftwareUpgradeProposal gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 1000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const gas = await firma.Gov.getGasEstimationSubmitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);
		console.log("estimateGas : " + gas);
	});

	it("7-6. Gov deposit & vote gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const proposalList = await firma.Gov.getProposalList();
		const proposalId = Number(proposalList[proposalList.length - 1].proposal_id) + 1;

		const title = `Text Proposal ${proposalId}`;
		const description = "This is a text proposal";
		const initDeposit = 5000;
		const depositAmount = 5000;

		const result = await firma.Gov.submitTextProposal(aliceWallet, title, description, initDeposit);
		console.log(result);
		
		const depositGas = await firma.Gov.getGasEstimationDeposit(aliceWallet, proposalId, depositAmount);
		console.log("deposit estimateGas : " + depositGas);
		
		const voteGas = await firma.Gov.getGasEstimationVote(aliceWallet, proposalId, VotingOption.VOTE_OPTION_YES);
		console.log("vote estimateGas : " + voteGas);
	});

	// it("7-7. Gov vote gas estimation", async () => {

	// 	const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
	// 	const proposalId = 1;

	// 	const gas = await firma.Gov.getGasEstimationVote(wallet, proposalId, VotingOption.VOTE_OPTION_YES);
	// 	console.log("estimateGas : " + gas);
	// });

	it("8-1. Token createToken gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const tokenName = "KOMX TOKEN";
		const symbol = "KOMX";
		const tokenURI = "https://firmachain.org";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		const gas = await firma.Token.getGasEstimationCreateToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		console.log("estimateGas : " + gas);
	});

	it("8-2. Token mint & burn gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();

		const timeStamp = Math.round(+new Date() / 1000);

		const tokenName = `KOMX TOKEN${timeStamp}`;
		const symbol = `KOMX${timeStamp}`;
		const tokenID = `ukomx${timeStamp}`;
		const tokenURI = "https://firmachain.org";
		const totalSupply = 10000000;
		const decimal = 6;
		const isMintable = true;
		const isBurnable = true;
		const amount = 10000;

		await firma.Token.createToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, isMintable, isBurnable);
		const mintGas = await firma.Token.getGasEstimationMint(wallet, tokenID, amount, decimal, bobAddress);
		console.log("estimate mint gas : " + mintGas);
		const burnGas = await firma.Token.getGasEstimationBurn(wallet, tokenID, amount, decimal);
		console.log("estimate burn gas : " + burnGas);
		await firma.Token.burn(wallet, tokenID, totalSupply, decimal);
	});

	// it("8-3. Token burn gas estimation", async () => {

	// 	const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

	// 	const tokenID = "ukomx6";
	// 	const amount = 10;
	// 	const decimal = 6;

	// 	const gas = await firma.Token.getGasEstimationBurn(wallet, tokenID, amount, decimal);
	// 	console.log("estimateGas : " + gas);
	// });

	it("8-3. Token updateTokenURI gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const timeStamp = Math.round(+new Date() / 1000);
		
		const tokenName = `KOMX TOKEN${timeStamp}`;
		const symbol = `KOMX${timeStamp}`;
		const tokenID = `ukomx${timeStamp}`;
		const tokenURI = "https://firmachain.org";
		const totalSupply = 10000000;
		const decimal = 6;
		const isMintable = true;
		const isBurnable = true;
		
		await firma.Token.createToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, isMintable, isBurnable);
		
		const updateTokenURI = "https://firmachain.org";
		const gas = await firma.Token.getGasEstimationUpdateTokenURI(wallet, tokenID, updateTokenURI);
		console.log("estimateGas : " + gas);
		await firma.Token.burn(wallet, tokenID, totalSupply, decimal);
	});
});