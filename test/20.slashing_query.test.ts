import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[20. Slashing Query Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	});

	it('getSlashingParam test', async () => {
		const result = await firma.Slashing.getSlashingParam();

		expect(result).to.have.property('signed_blocks_window');
		expect(result).to.have.property('min_signed_per_window');
		expect(result).to.have.property('downtime_jail_duration');
		expect(result).to.have.property('slash_fraction_double_sign');
		expect(result).to.have.property('slash_fraction_downtime');
		
		expect(result.signed_blocks_window).to.not.be.empty;
		expect(result.min_signed_per_window).to.not.be.empty;
		expect(result.downtime_jail_duration).to.not.be.empty;
		expect(result.slash_fraction_double_sign).to.not.be.empty;
		expect(result.slash_fraction_downtime).to.not.be.empty;
	});

	it('getSigningInfos test', async () => {
		const result = await firma.Slashing.getSigningInfos();

		if (result.length > 0) {
			expect(result[0]).to.have.property('address');
			expect(result[0]).to.have.property('start_height');
			expect(result[0]).to.have.property('index_offset');
			expect(result[0]).to.have.property('jailed_until');
			expect(result[0]).to.have.property('tombstoned');
			expect(result[0]).to.have.property('missed_blocks_counter');
			
			expect(result[0].address).to.not.be.empty;
		}
	});

	it('getSigningInfo test', async () => {
		const infos = await firma.Slashing.getSigningInfos();
		
		if (infos.length > 0) {
			const result = await firma.Slashing.getSigningInfo(infos[0].address);
			
			expect(result).to.have.property('address');
			expect(result).to.have.property('start_height');
			expect(result).to.have.property('index_offset');
			expect(result).to.have.property('jailed_until');
			expect(result).to.have.property('tombstoned');
			expect(result).to.have.property('missed_blocks_counter');
			
			expect(result.address).to.equal(infos[0].address);
		}
	});
});