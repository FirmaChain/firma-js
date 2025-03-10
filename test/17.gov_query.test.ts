import { ProposalStatus, VotingOption } from '../sdk/firmachain/gov';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { aliceMnemonic, bobMnemonic, TestChainConfig, validatorMnemonic } from './config_test';

describe('[17. Gov Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('get getProposalList', async () => {

		let proposalList = await firma.Gov.getProposalList();
		//console.log(proposalList);
	})

	it('get getProposalListByStatus', async () => {

		let status = ProposalStatus.PROPOSAL_STATUS_REJECTED;
		let proposalList = await firma.Gov.getProposalListByStatus(status);

		//console.log(proposalList);
	})

	it('get getProposal', async () => {

		let proposalList = await firma.Gov.getProposalList();

		try {
			if (proposalList.length > 0) {
				const id = proposalList[proposalList.length - 1].proposal_id;
				let proposal = await firma.Gov.getProposal(id);
				//console.log(proposal);
			}
		} catch (error) {
			console.log(error);
		}
	})

	// integrated function with params/voting, params/deposit, params/tallying
	it('get params', async () => {

		let param = await firma.Gov.getParam();
		//console.log(param);
	})

	// current tally info
	it('get getCurrentVoteInfo', async () => {

		try {
			const proposalList = await firma.Gov.getProposalList();
			const lastProposalId = Number(proposalList[proposalList.length - 1].proposal_id) + 1;

			const title = `Text proposal ${lastProposalId}`;
			const description = `This is a text proposal(${lastProposalId})`;
			const initialDeposit = 5000;

			const validatorWallet = await firma.Wallet.fromMnemonic(validatorMnemonic);
			await firma.Gov.submitTextProposal(validatorWallet, title, description, initialDeposit);

			// Alice
			const aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
			const aliceVotingResult = await firma.Gov.vote(aliceWallet, lastProposalId, VotingOption.VOTE_OPTION_YES);
			// Bob
			const bobWallet = await firma.Wallet.fromMnemonic(bobMnemonic);
			const bobVotingResult = await firma.Gov.vote(bobWallet, lastProposalId, VotingOption.VOTE_OPTION_NO);

			const voteInfo = await firma.Gov.getCurrentVoteInfo(lastProposalId.toString());
		} catch (error) {
			console.log(error);
		}
	})
});