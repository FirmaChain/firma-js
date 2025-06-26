import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[19. chain Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('getChainStatus test', async () => {
		const result = await firma.BlockChain.getChainSyncInfo();

		expect(result).to.be.an('object');
		
		expect(result).to.have.property('latest_block_hash');
		expect(result).to.have.property('latest_app_hash');
		expect(result).to.have.property('latest_block_height');
		expect(result).to.have.property('latest_block_time');
		
		expect(result).to.have.property('earliest_block_hash');
		expect(result).to.have.property('earliest_app_hash');
		expect(result).to.have.property('earliest_block_height');
		expect(result).to.have.property('earliest_block_time');
		
		expect(result).to.have.property('catching_up');
		
		expect(parseInt(result.latest_block_height)).to.be.a('number');
		expect(parseInt(result.earliest_block_height)).to.be.a('number');
		expect(parseInt(result.latest_block_height)).to.be.greaterThan(0);
		expect(parseInt(result.earliest_block_height)).to.be.greaterThan(0);
	});

	// This test requires a meaningful transaction hash, so it is skipped by default.
	it('getTransactionByHash test', async () => {

		const txHash = "0x5DA9D094D15660D21947C9EEF1329CCB70117E7BCD3A451F27E5C7AFF5DB6DF0";
		try {
			const result = await firma.BlockChain.getTransactionByHash(txHash);
			
			expect(result).to.have.property('hash');
			expect(result).to.have.property('height');
			expect(result).to.have.property('index');
			expect(result).to.have.property('tx_result');
			expect(result).to.have.property('tx');
			
			expect(result.hash).to.equal(txHash);
			
			expect(parseInt(result.height)).to.be.greaterThan(0);
			
			expect(result.index).to.be.greaterThanOrEqual(0);
			
			expect(result.tx_result).to.have.property('code');
			expect(result.tx_result).to.have.property('data');
			expect(result.tx_result).to.have.property('log');
			expect(result.tx_result).to.have.property('info');
			expect(result.tx_result).to.have.property('gas_wanted');
			expect(result.tx_result).to.have.property('gas_used');
			expect(result.tx_result).to.have.property('events');
			expect(result.tx_result).to.have.property('codespace');
		} catch (error) {
			expect(error).to.exist;
		}
	});

	it('getChainInfo test', async () => {
		const result = await firma.BlockChain.getChainInfo();
		
		expect(result).to.have.property('chainId');
		expect(result).to.have.property('appVersion');
		expect(result).to.have.property('cosmosVersion');

		expect(result.chainId).to.not.be.empty;
		expect(result.appVersion).to.not.be.empty;
		expect(result.cosmosVersion).to.not.be.empty;
	});
});