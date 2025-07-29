import { expect } from 'chai';
import { ProposalStatus } from '../sdk/firmachain/gov';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[17. Gov Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('get getProposalList', async () => {

		const proposalList: any = await firma.Gov.getProposalList({ reverse: true });

		if (proposalList.length > 0) {
			expect(proposalList[0].id).to.not.equal('');
		} else {
			expect(proposalList).to.be.deep.equal([]);
		}
	});

	it('get getAllProposalList', async () => {
		const allProposals = await firma.Gov.getAllProposalList();

		// Check if proposals are properly ordered by ID
		if (allProposals.length > 0) {

			// Basic checks
			expect(allProposals[0].id).to.not.equal('');
			expect(allProposals.length).to.be.greaterThan(0);
		} else {
			expect(allProposals).to.be.deep.equal([]);
		}
	});

	it('get getProposalListByStatus', async () => {

		const status = ProposalStatus.PROPOSAL_STATUS_REJECTED;
		const proposalList = await firma.Gov.getProposalListByStatus(status);
		
		expect(proposalList).to.be.an('array');
		
		if (proposalList.length > 0) {
			expect(proposalList[0]).to.have.property('id');
			expect(proposalList[0].id).to.not.equal('');
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});

	it('get getProposal', async () => {

		const proposalList = await firma.Gov.getProposalList();
		if (proposalList.length > 0) {
			const id = "1";
			const proposal = await firma.Gov.getProposal(id);
			
			expect(proposal).to.be.an('object');
			expect(proposal).to.have.property('id');
			expect(proposal.id).to.equal(id);
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});

	// integrated function with params/voting, params/deposit, params/tallying
	it('get params', async () => {

		const param = await firma.Gov.getParam();
		expect(param).to.be.an('object');
	});

	// integrated function with params/voting, params/deposit, params/tallying - GovParams
	it('get params as GovParams', async () => {
		
		const param = await firma.Gov.getParamAsGovParams();
		expect(param).to.be.an('object');
	});

	// current tally info
	it('get getCurrentVoteInfo', async () => {

		const proposalList = await firma.Gov.getProposalList();

		if (proposalList.length > 0) {
			const proposalId = "1";
			let param = await firma.Gov.getCurrentVoteInfo(proposalId);
			
			expect(param).to.be.an('object');
			expect(param).to.have.property('yes_count');
			expect(param).to.have.property('abstain_count');
			expect(param).to.have.property('no_count');
			expect(param).to.have.property('no_with_veto_count');
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});
});