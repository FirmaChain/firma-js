import { ProposalStatus } from '../sdk/firmachain/gov';
import { FirmaSDK } from '../sdk/FirmaSDK';
import { TestChainConfig } from './config_test';

describe('[17. Gov Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('get getProposalList', async () => {

		let proposalList = await firma.Gov.getProposalList();
	})

	it('get getProposalListByStatus', async () => {

		let status = ProposalStatus.PROPOSAL_STATUS_REJECTED;
		let proposalList = await firma.Gov.getProposalListByStatus(status);
	})

	it('get getProposal', async () => {

		let proposalList = await firma.Gov.getProposalList();

		if (proposalList.length > 0) {
			const id = "1";
			let proposal = await firma.Gov.getProposal(id);
		}
	})

	// integrated function with params/voting, params/deposit, params/tallying
	it('get params', async () => {

		let param = await firma.Gov.getParam();
	})

	// current tally info
	it('get getCurrentVoteInfo', async () => {

		let proposalList = await firma.Gov.getProposalList();

		if (proposalList.length > 0) {
			const proposalId = "1";
			let param = await firma.Gov.getCurrentVoteInfo(proposalId);
		}
	})
});