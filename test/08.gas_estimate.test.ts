import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK'
import { FirmaUtil } from '../sdk/FirmaUtil';
import { VotingOption } from '../sdk/firmachain/common';
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[08. Gas Estimation Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it("1-1. bank send gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 1;

		const gas = await firma.Bank.getGasEstimationSend(wallet, await targetWallet.getAddress(), amount);
		expect(gas).to.not.equal(0);
	});

	it("1-2. bank sendToken gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const amount = 1;
		const tokenID = "ukomx";
		const decimal = 6;

		const gas = await firma.Bank.getGasEstimationSendToken(wallet, await targetWallet.getAddress(), tokenID, amount, decimal);
		expect(gas).to.not.equal(0);
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
		expect(gas).to.not.equal(0);
	});

	it("2-2. Contract addContractLog gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = await wallet.getAddress();
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationAddContractLog(wallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		expect(gas).to.not.equal(0);
	});

	it("2-3. Contract createContractFile gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random time
		const ownerAddress = await wallet.getAddress();
		const ownerList = [ownerAddress, ownerAddress];
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationCreateContractFile(wallet, fileHash, timeStamp, ownerList, jsonString);
		expect(gas).to.not.equal(0);
	});

	it("3-1. NFT Mint gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const gas = await firma.Nft.getGasEstimationMint(wallet, "https://naver.com");
		expect(gas).to.not.equal(0);
	});

	it("3-2. NFT Transfer gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const targetWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const result = await firma.Nft.mint(wallet, "https://naver.com");
		const jsonData = JSON.parse(result.rawLog!);
		const nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		const gas = await firma.Nft.getGasEstimationTransfer(wallet, await targetWallet.getAddress(), nftId);
		expect(gas).to.not.equal(0);
	});

	it("3-3. NFT Burn gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const result = await firma.Nft.mint(wallet, "https://naver.com");
		const jsonData = JSON.parse(result.rawLog!);
		const nftId = jsonData[0]["events"][0]["attributes"][2]["value"];

		const gas = await firma.Nft.getGasEstimationBurn(wallet, nftId);
		expect(gas).to.not.equal(0);
	});

	it("4-1. Feegrant GrantPeriodicAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		const spendLimit = 2000;
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 2);
		let periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: spendLimit,
			periodCanSpend: 10000,
			periodReset: expirationDate
		};

		const gas = await firma.FeeGrant.getGasEstimationGrantPeriodicAllowance(aliceWallet, await bobWallet.getAddress(), periodicAllowanceData);
		expect(gas).to.not.equal(0);
	});

	it("4-2. Feegrant GrantBasicAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const gas = await firma.FeeGrant.getGasEstimationGrantBasicAllowance(aliceWallet, await bobWallet.getAddress());
		expect(gas).to.not.equal(0);
	});

	it("4-3. Feegrant revokeAllowance gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const gas = await firma.FeeGrant.getGasEstimationRevokeAllowance(aliceWallet, await bobWallet.getAddress());
		expect(gas).to.not.equal(0);
	});

	it("5-1. Staking delegate gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());
		const amountFCT = 60;

		const gas = await firma.Staking.getGasEstimationDelegate(wallet, validatorAddress, amountFCT);
		expect(gas).to.not.equal(0);
	});

	it("5-2. Staking undelegate gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(await validatorWallet.getAddress());
		const amount = 5;

		const gas = await firma.Staking.getGasEstimationUndelegate(wallet, validatorAddress, amount);
		expect(gas).to.not.equal(0);
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
		const gas = await firma.Staking.getGasEstimationRedelegate(wallet, srcValidatorAddress, dstValidatorAddress, amount, { gas: 300000, fee: 30000 });
		expect(gas).to.not.equal(0);
	});

	it("6-1. Distribution withdrawAllRewards gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const delegationList = (await (await firma.Staking.getTotalDelegationInfo(await wallet.getAddress())).dataList);
		const validatorAddress = delegationList[0].delegation.validator_address;

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewards(wallet, validatorAddress);
		expect(gas).to.not.equal(0);
	});

	it("6-2. Distribution withdrawValidatorCommission gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const address = await wallet.getAddress();
		const validatorAddress = FirmaUtil.getValOperAddressFromAccAddress(address);

		const gas = await firma.Distribution.getGasEstimationWithdrawValidatorCommission(wallet, validatorAddress);
		expect(gas).to.not.equal(0);
	});

	it("6-3. Distribution fundCommunityPool gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		const amount = 1;

		const gas = await firma.Distribution.getGasEstimationFundCommunityPool(wallet, amount);
		expect(gas).to.not.equal(0);
	});

	it("6-4. Distribution setWithdrawAddress gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);

		const gas = await firma.Distribution.getGasEstimationSetWithdrawAddress(aliceWallet, await bobWallet.getAddress());
		expect(gas).to.not.equal(0);
	});

	it("7-1. Gov submitTextProposal gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10;
		const title = "test submit proposal";
		const description = "test description";

		const gas = await firma.Gov.getGasEstimationSubmitTextProposal(wallet, title, description, initialDepositFCT);
		expect(gas).to.not.equal(0);
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
		expect(gas).to.not.equal(0);
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
		expect(gas).to.not.equal(0);
	});

	it("7-4. Gov submitSoftwareUpgradeProposalByHeight gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 10000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const upgradeName = "v0.2.7";
		const upgradeHeight = 20000000;

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposalByHeight(aliceWallet, title, description, initialDepositFCT, upgradeName, upgradeHeight);
		expect(gas).to.not.equal(0);
	});

	it("7-5. Gov submitCancelSoftwareUpgradeProposal gas estimation", async () => {

		const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const initialDepositFCT = 1000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const gas = await firma.Gov.getGasEstimationSubmitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);
		expect(gas).to.not.equal(0);
	});

	it("7-6. Gov deposit gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);

		const proposalId = 1;
		const amount = 1000;

		const gas = await firma.Gov.getGasEstimationDeposit(wallet, proposalId, amount);
		expect(gas).to.not.equal(0);
	});

	it("7-7. Gov vote gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const proposalId = 1;

		const gas = await firma.Gov.getGasEstimationVote(wallet, proposalId, VotingOption.VOTE_OPTION_YES);
		expect(gas).to.not.equal(0);
	});

	it("8-1. Token createToken gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const tokenName = "KOMX TOKEN";
		const symbol = "KOMX63232";
		const tokenURI = "https://naver.com";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		const gas = await firma.Token.getGasEstimationCreateToken(wallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(gas).to.not.equal(0);
	});

	it("8-2. Token mint gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const bobAddress = await (await firma.Wallet.fromMnemonic(bobMnemonic)).getAddress();
		const tokenID = "ukomx6";
		const amount = 10000;
		const decimal = 6;

		const gas = await firma.Token.getGasEstimationMint(wallet, tokenID, amount, decimal, bobAddress);
		expect(gas).to.not.equal(0);
	});

	it("8-3. Token burn gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const tokenID = "ukomx6";
		const amount = 10;
		const decimal = 6;

		const gas = await firma.Token.getGasEstimationBurn(wallet, tokenID, amount, decimal);
		expect(gas).to.not.equal(0);
	});

	it("8-4. Token updateTokenURI gas estimation", async () => {

		const wallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		const tokenID = "ukomx6";
		const tokenURI = "https://firmachain.org";

		const gas = await firma.Token.getGasEstimationUpdateTokenURI(wallet, tokenID, tokenURI);
		expect(gas).to.not.equal(0);
	});
});