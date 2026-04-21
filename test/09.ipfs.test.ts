import { expect } from 'chai';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { TestChainConfig } from './config_test';

describe('[09. IPFS Test]', () => {

	let firma: FirmaSDK;

	beforeEach(function() {
		firma = new FirmaSDK(TestChainConfig);
	})

	it('ipfs add proposal json', async () => {
		
		// JSON (Proposal)
		const proposalJson = `{
			"title": "FirmaChain CommunityPoolSpend Proposal",
			"authors": [
				"firma1nssuz67am2uwc2hjgvphg0fmj3k9l6cx65ux9u"
			],
			"summary": "Summary Section",
			"details": "Details Section",
			"proposal_forum_url": "explorer-testnet.firmachain.dev",
			"vote_option_context": "Yes, No, Vote, Abstain"
		}`;
		let hash = await firma.Ipfs.addJson(proposalJson);
		expect(hash).to.equal("QmT7eJ668Hr6LbUsyAESenV6QRW84Rz3mGkLcFhs1rRxa7");

		// Buffer
		const arrBuf = new ArrayBuffer(1000);
		hash = await firma.Ipfs.addBuffer(arrBuf);
		expect(hash).to.equal("QmT7eJ668Hr6LbUsyAESenV6QRW84Rz3mGkLcFhs1rRxa7");
		let url = firma.Ipfs.getURLFromHash(hash);
		let srcUrl = firma.Config.ipfsWebApiAddress + "/ipfs/QmVRqQTWMy2gNtNd8i9ugz8STaoZmFGYg6fn5YyEBHp9Be";
		expect(srcUrl).to.equal(url);

		// File (Image)
		hash = await firma.Ipfs.addFile("./test/sample/test-bear.jpg");
		url = firma.Ipfs.getURLFromHash(hash);
		srcUrl = firma.Config.ipfsWebApiAddress + "/ipfs/QmYsezxzunake9EmyoU4HsWKEyHQLgE3syTEpTSQEhNChA";
		expect(srcUrl).to.equal(url);
	});
});