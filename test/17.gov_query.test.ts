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

		const proposalList: any = [];
		if (proposalList.length > 0) {
			expect(proposalList[0].id).to.not.equal('');
		} else {
			expect(proposalList).to.be.deep.equal([]);
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
			expect(param).to.have.property('yes');
			expect(param).to.have.property('abstain');
			expect(param).to.have.property('no');
			expect(param).to.have.property('no_with_veto');
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});
});