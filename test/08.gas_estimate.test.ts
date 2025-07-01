import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK'
import { FirmaUtil } from '../sdk/FirmaUtil';
import { VotingOption } from '../sdk/firmachain/common';
import { FirmaWalletService } from '../sdk/FirmaWalletService';
import { Plan } from '@kintsugi-tech/cosmjs-types/cosmos/upgrade/v1beta1/upgrade';
import { Params as StakingParams } from 'cosmjs-types/cosmos/staking/v1beta1/staking';

import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[08. Gas Estimation Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let bobWallet: FirmaWalletService;
	let aliceAddress: string;
	let bobAddress: string;
	let validatorWallet: FirmaWalletService;
	let validatorAddress: string;
	let valOperAddress: string;

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
		aliceAddress = await aliceWallet.getAddress();
		bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
		bobAddress = await bobWallet.getAddress();
		validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
		validatorAddress = await validatorWallet.getAddress();
		valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);
	})

	it("1-1. bank send gas estimation", async () => {

		const amount = 1;
		const gas = await firma.Bank.getGasEstimationSend(aliceWallet, bobAddress, amount);
		expect(gas).to.not.equal(0);
	});

	it("1-2. bank sendToken gas estimation", async () => {
		
		const timestamp = Math.round(+new Date() / 1000);
		const tokenName = "KOMX TOKEN";
		const tokenId = `ukomx${timestamp}`;
		const tokenSymbol = `KOMX${timestamp}`;
		const tokenURI = "https://token.firmachain.dev";
		const tokenSupply = 100000000;
		const decimal = 6;
		const mintAmount = 10;
		const sendAmount = 1;

		const createResult = await firma.Token.createToken(aliceWallet, tokenName, tokenSymbol, tokenURI, tokenSupply, decimal, true, true);
		expect(createResult.code).to.be.equal(0);

		const mintResult = await firma.Token.mint(aliceWallet, tokenId, mintAmount, decimal, aliceAddress);
		expect(mintResult.code).to.be.equal(0);

		const gas = await firma.Bank.getGasEstimationSendToken(aliceWallet, bobAddress, tokenId, sendAmount, decimal);
		expect(gas).to.not.equal(0);
	});

	it("2-1. Contract addContractLog getGasEstimationFromUnSignedTxList gas estimation", async () => {

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = aliceAddress
		const jsonString = "{}";
		const tx1 = await firma.Contract.getUnsignedTxAddContractLog(aliceWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);

		const gas = await firma.Contract.getGasEstimationFromUnSignedTxList(aliceWallet, [tx1, tx1, tx1, tx1, tx1]);
		expect(gas).to.not.equal(0);
	});

	it("2-2. Contract addContractLog gas estimation", async () => {

		const contractHash = "0xsalkdjfasldkjf2";
		const timeStamp = Math.round(+new Date() / 1000);;
		const eventName = "CreateContract";
		const ownerAddress = aliceAddress;
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationAddContractLog(aliceWallet, contractHash, timeStamp, eventName, ownerAddress, jsonString);
		expect(gas).to.not.equal(0);
	});

	it("2-3. Contract createContractFile gas estimation", async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const fileHash = "0xklsdjflaksjflaksjf" + timeStamp; // random time
		const ownerAddress = aliceAddress;
		const ownerList = [ownerAddress, bobAddress];
		const jsonString = "{}";

		const gas = await firma.Contract.getGasEstimationCreateContractFile(aliceWallet, fileHash, timeStamp, ownerList, jsonString);
		expect(gas).to.not.equal(0);
	});

	it("3-1. NFT Mint gas estimation", async () => {

		const gas = await firma.Nft.getGasEstimationMint(aliceWallet, "https://naver.com");
		expect(gas).to.not.equal(0);
	});

	it("3-2. NFT Transfer gas estimation", async () => {

		const result = await firma.Nft.mint(aliceWallet, "https://naver.com");
		expect(result.code).to.be.equal(0);

		const nftId = extractValue(result.events, "message", "nftID");
		const gas = await firma.Nft.getGasEstimationTransfer(aliceWallet, bobAddress, nftId);
		expect(gas).to.not.equal(0);
	});

	it("3-3. NFT Burn gas estimation", async () => {

		const result = await firma.Nft.mint(aliceWallet, "https://naver.com");
		expect(result.code).to.be.equal(0);

		const nftId = extractValue(result.events, "message", "nftID");
		const gas = await firma.Nft.getGasEstimationBurn(aliceWallet, nftId);
		expect(gas).to.not.equal(0);
	});

	it("4-1. Feegrant GrantPeriodicAllowance gas estimation", async () => {

		const spendLimit = 2000;
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 2);
		const periodicAllowanceData = {
			// basicSpendLimit: undefined,
			// basicExpiration: undefined,
			periodSeconds: 30,
			periodSpendLimit: spendLimit,
			periodCanSpend: 10000,
			periodReset: expirationDate
		};

		const gas = await firma.FeeGrant.getGasEstimationGrantPeriodicAllowance(bobWallet, aliceAddress, periodicAllowanceData);
		expect(gas).to.not.equal(0);
	});

	it("4-2. Feegrant GrantBasicAllowance gas estimation", async () => {

		const gas = await firma.FeeGrant.getGasEstimationGrantBasicAllowance(bobWallet, aliceAddress);
		expect(gas).to.not.equal(0);
	});

	it("4-3. Feegrant revokeAllowance gas estimation", async () => {

		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 20);
		const result = await firma.FeeGrant.grantBasicAllowance(aliceWallet, bobAddress, { expiration : expirationDate});
		expect(result.code).to.equal(0);

		const gas = await firma.FeeGrant.getGasEstimationRevokeAllowance(aliceWallet, bobAddress);
		expect(gas).to.not.equal(0);

		const fee = Math.ceil(gas * 0.1);
		await firma.FeeGrant.revokeAllowance(aliceWallet, bobAddress, { gas, fee });
	});

	it("5-1. Staking delegate gas estimation", async () => {

		const amountFCT = 60;
		const gas = await firma.Staking.getGasEstimationDelegate(aliceWallet, valOperAddress, amountFCT);
		expect(gas).to.not.equal(0);
	});

	it("5-2. Staking undelegate gas estimation", async () => {

		const amount = 5;
		const gas = await firma.Staking.getGasEstimationUndelegate(aliceWallet, valOperAddress, amount);
		expect(gas).to.not.equal(0);
	});

	/*
		This test may fail even with a valid call due to the following two reasons:
	  - The maximum number of allowed redelegations (7) has been exceeded
	  - There are no delegated tokens to the srcValidatorAddress
	*/
	it("5-3. Staking redelegate gas estimation", async () => {
		
		const validatorList = (await firma.Staking.getValidatorList()).dataList;
		if (validatorList.length < 2)
			return;

		const srcValidatorAddress = validatorList[0].operator_address;
		const dstValidatorAddress = validatorList[1].operator_address;

		const amount = 10;

		// NOTICE: there's a case for use more than 200000 gas here.
		const gas = await firma.Staking.getGasEstimationRedelegate(aliceWallet, srcValidatorAddress, dstValidatorAddress, amount, { gas: 300000, fee: 30000 });
		expect(gas).to.not.equal(0);
	});

	it("6-1. Distribution withdrawAllRewards gas estimation", async () => {

		const delegationList = (await firma.Staking.getTotalDelegationInfo(aliceAddress)).dataList;
		const validatorAddress = delegationList[0].delegation.validator_address;

		const gas = await firma.Distribution.getGasEstimationWithdrawAllRewards(aliceWallet, validatorAddress);
		expect(gas).to.not.equal(0);
	});

	it("6-2. Distribution withdrawValidatorCommission gas estimation", async () => {

		const valOperAddress = FirmaUtil.getValOperAddressFromAccAddress(validatorAddress);
		const gas = await firma.Distribution.getGasEstimationWithdrawValidatorCommission(validatorWallet, valOperAddress);
		expect(gas).to.not.equal(0);
	});

	it("6-3. Distribution fundCommunityPool gas estimation", async () => {

		const amount = 1;
		const gas = await firma.Distribution.getGasEstimationFundCommunityPool(validatorWallet, amount);
		expect(gas).to.not.equal(0);
	});

	it("6-4. Distribution setWithdrawAddress gas estimation", async () => {

		const gas = await firma.Distribution.getGasEstimationSetWithdrawAddress(aliceWallet, bobAddress);
		expect(gas).to.not.equal(0);
	});

	it("7-1. Gov submitTextProposal gas estimation", async () => {

		const initialDepositFCT = 2500;
		const title = "test submit proposal";
		const description = "test description";

		try {

			const gas = await firma.Gov.getGasEstimationSubmitTextProposal(aliceWallet, title, description, initialDepositFCT);
			expect(gas).to.not.equal(0);
		} catch (error) {
			console.log(error);
		}
	});

	it("7-2. Gov submitCommunityPoolSpendProposal gas estimation", async () => {

		const initialDepositFCT = 2500;
    const title = "Community spend proposal";
    const summary = "Proposal to spend from community pool";
    const amountFCT = 1000;
    const recipient = bobAddress;

		const gas = await firma.Gov.getGasEstimationSubmitCommunityPoolSpendProposal(
			aliceWallet,
			title,
			summary,
			initialDepositFCT,
			amountFCT,
			recipient
		);

		expect(gas).to.not.equal(0);
	});

	it("7-3. Gov submitStakingParamsUpdateProposal gas estimation", async () => {
		
		const initialDepositFCT = 5000;
		const title = "Staking parameter change proposal";
		const summary = "This is a Staking parameter change proposal";

		const stakingParmas = await firma.Staking.getParams();
		const changeValue = 100;
		const unbondingData = parseDuration(stakingParmas.unbonding_time);

		const changeStakingParams: StakingParams = {
			unbondingTime: { seconds: BigInt(unbondingData.seconds), nanos: unbondingData.nanos },
			maxValidators: changeValue,
			maxEntries: stakingParmas.max_entries,
			historicalEntries: stakingParmas.historical_entries,
			bondDenom: stakingParmas.bond_denom,
			minCommissionRate: toDec18String(stakingParmas.min_commission_rate)
		};
		const metadata = "";

		const gas = await firma.Gov.getGasEstimationSubmitStakingParamsUpdateProposal(aliceWallet, title, summary, initialDepositFCT, changeStakingParams, metadata);
		expect(gas).to.not.equal(0);

		function toDec18String(decimal: string): string {
			return BigInt(parseFloat(decimal) * 1e18).toString();
		}

		function parseDuration(durationStr: string): { seconds: bigint; nanos: number } {
			const match = /^(\d+)(\.(\d+))?s$/.exec(durationStr);
			if (!match) throw new Error(`Invalid duration string: ${durationStr}`);
		
			const seconds = BigInt(match[1]);
			const fractionalPart = match[3] || "";
			const padded = (fractionalPart + "000000000").slice(0, 9);
			const nanos = Number(padded);
		
			return { seconds, nanos };
		}
	});

	it("7-4. Gov submitSoftwareUpgradeProposal gas estimation", async () => {

		const initialDepositFCT = 5000;
		const title = "Software Upgrade proposal1";
		const summary = "This is a software upgrade proposal";
		// deprecated plan time option
		const plan: Plan = {
			name: 'v0.5.1',
			time: {
				seconds: BigInt(0),
				nanos: 0
			},
			height: BigInt(1050000),
			info: ''
		};
		const metadata = "";

		const gas = await firma.Gov.getGasEstimationSubmitSoftwareUpgradeProposal(aliceWallet, title, summary, initialDepositFCT, plan, metadata);
		expect(gas).to.not.equal(0);
	});

	it.skip("7-5. Gov submitCancelSoftwareUpgradeProposal gas estimation", async () => {

		const initialDepositFCT = 1000;
		const title = "Software Upgrade proposal1";
		const description = "This is a software upgrade proposal";

		const gas = await firma.Gov.getGasEstimationSubmitCancelSoftwareUpgradeProposal(aliceWallet, title, description, initialDepositFCT);
		expect(gas).to.not.equal(0);
	});

	it.skip("7-6. Gov deposit gas estimation", async () => {

		const proposalId = 1;
		const amount = 1000;

		const gas = await firma.Gov.getGasEstimationDeposit(aliceWallet, proposalId, amount);
		expect(gas).to.not.equal(0);
	});

	it.skip("7-7. Gov vote gas estimation", async () => {

		const proposalId = 1;

		const gas = await firma.Gov.getGasEstimationVote(aliceWallet, proposalId, VotingOption.VOTE_OPTION_YES);
		expect(gas).to.not.equal(0);
	});

	it("8-1. Token createToken gas estimation", async () => {

		const tokenName = "KOMX TOKEN";
		const symbol = "KOMX63232";
		const tokenURI = "https://naver.com";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		const gas = await firma.Token.getGasEstimationCreateToken(aliceWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(gas).to.not.equal(0);
	});

	it("8-2. Token mint gas estimation", async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const tokenName = "KOMX TOKEN" + timeStamp;
		const symbol = "KOMX" + timeStamp;
		const tokenURI = "https://naver.com";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;
		
		const createResult = await firma.Token.createToken(aliceWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(createResult.code).to.equal(0);
		
		const tokenID = "ukomx" + timeStamp;
		const amount = 10000;
		const gas = await firma.Token.getGasEstimationMint(aliceWallet, tokenID, amount, decimal, bobAddress);
		expect(gas).to.not.equal(0);
	});

	it("8-3. Token burn gas estimation", async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const tokenName = "KOMX TOKEN" + timeStamp;
		const symbol = "KOMX" + timeStamp;
		const tokenURI = "https://naver.com";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		const createResult = await firma.Token.createToken(aliceWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(createResult.code).to.equal(0);

		const tokenID = "ukomx" + timeStamp;
		const amount = 10;
		const mintResult = await firma.Token.mint(aliceWallet, tokenID, amount, decimal, bobAddress);
		expect(mintResult.code).to.equal(0);

		const gas = await firma.Token.getGasEstimationBurn(aliceWallet, tokenID, amount, decimal);
		expect(gas).to.not.equal(0);
	});

	it("8-4. Token updateTokenURI gas estimation", async () => {

		const timeStamp = Math.round(+new Date() / 1000);
		const tokenName = "KOMX TOKEN" + timeStamp;
		const symbol = "KOMX" + timeStamp;
		const tokenURI = "https://naver.com";
		const totalSupply = 10000;
		const decimal = 6;
		const mintable = true;
		const burnable = true;

		const createResult = await firma.Token.createToken(aliceWallet, tokenName, symbol, tokenURI, totalSupply, decimal, mintable, burnable);
		expect(createResult.code).to.equal(0);

		const tokenID = "ukomx" + timeStamp;
		const newTokenURI = "https://firmachain.org";

		const gas = await firma.Token.getGasEstimationUpdateTokenURI(aliceWallet, tokenID, newTokenURI);
		expect(gas).to.not.equal(0);
	});
});