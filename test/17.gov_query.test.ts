import { ProposalStatus } from '../sdk/firmachain/gov';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { TestChainConfig } from './config_test';

describe('[17. Gov Query Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

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

		const id = "1";
		let proposal = await firma.Gov.getProposal(id);
		//console.log(proposal);
	})

	// integrated function with params/voting, params/deposit, params/tallying
	it('get params', async () => {

		let param = await firma.Gov.getParam();
		//console.log(param);
	})

});