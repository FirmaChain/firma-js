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
			expect(proposalList[0].proposal_id).to.not.equal('');
		} else {
			expect(proposalList).to.be.deep.equal([]);
		}
	});

	it('get getProposalListByStatus', async () => {

		const status = ProposalStatus.PROPOSAL_STATUS_REJECTED;
		const proposalList = await firma.Gov.getProposalListByStatus(status);
		
		expect(proposalList).to.be.an('array');
		
		if (proposalList.length > 0) {
			expect(proposalList[0]).to.have.property('proposal_id');
			expect(proposalList[0].proposal_id).to.not.equal('');
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});

	it('get getProposal', async () => {

		const proposalList = await firma.Gov.getProposalList();

		if (proposalList.length > 0) {
			const id = "1";
			const proposal = await firma.Gov.getProposal(id);
			
			// proposal이 올바른 구조를 가지고 있는지 확인
			expect(proposal).to.be.an('object');
			expect(proposal).to.have.property('proposal_id');
			expect(proposal.proposal_id).to.equal(id);
		} else {
			expect(proposalList).to.have.lengthOf(0);
		}
	});

	// integrated function with params/voting, params/deposit, params/tallying
	it('get params', async () => {

		const param = await firma.Gov.getParam();
		
		expect(param).to.be.an('object');
		
		expect(param).to.have.property('voting_period');
		
		expect(param).to.have.property('deposit_params');
		expect(param.deposit_params).to.have.property('min_deposit');
		expect(param.deposit_params).to.have.property('max_deposit_period');
		
		expect(param.deposit_params.min_deposit).to.be.an('array');
		if (param.deposit_params.min_deposit.length > 0) {
			expect(param.deposit_params.min_deposit[0]).to.have.property('denom');
			expect(param.deposit_params.min_deposit[0]).to.have.property('amount');
		}

		expect(param).to.have.property('tally_params');
		expect(param.tally_params).to.have.property('quorum');
		expect(param.tally_params).to.have.property('threshold');
		expect(param.tally_params).to.have.property('veto_threshold');
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