import { expect } from 'chai';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import { FirmaSDK } from '../sdk/FirmaSDK';

import { aliceMnemonic, TestChainConfig } from './config_test';
import { FirmaWalletService } from '../sdk/FirmaWalletService';

describe.skip('[28. IBC Tx Test]', () => {

	let firma: FirmaSDK;
	let aliceWallet: FirmaWalletService;
	let aliceAddress: string;

	beforeEach(async function() {
		firma = new FirmaSDK(TestChainConfig);
		aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		aliceAddress = await aliceWallet.getAddress();
	})

	it('IBC transfer', async () => {
		
		const sourcePort = "transfer";
		const sourceChannel = "channel-1";
		const denom = "ufct";
		const amount = "10";
		const receiver = "firma1320eclh4dwzx89qjap2q5n2hna07zs2vm8tzlu";

		// new by dh
		// https://explorer-testnet.firmachain.dev/transactions/B4245412560A108F7C987DF08C05A748278706E045B14961CE61E86786659592

		// old by cli
		// https://explorer-testnet.firmachain.dev/transactions/49FC4BBC973B72383DBCE9305DAC320B534814A539808FB6B20E9BC5A831C269

		// There're two ways to set timeout values (height vs timestamp)

		let clientState = await firma.Ibc.getClientState(sourceChannel, sourcePort);

		let revison_height = clientState.identified_client_state.client_state.latest_height.revision_height;
		let revison_number = clientState.identified_client_state.client_state.latest_height.revision_number;

		// ways : 1
		// Set target revision height : get revision height and add 1000 block (cli tx policy)
		// issues: because of ibc version difference, can't get revision info directly.
		const height: Height = Height.fromPartial({
			revisionHeight: BigInt(revison_height) + BigInt(1000),
			revisionNumber: BigInt(revison_number),
		});

		// ways : 2
		// for nano second(000000) and add 10min(600000) for timeout
		var timeStamp = (Date.now() + 600000).toString() + "000000";

		const timeoutTimeStamp = BigInt(timeStamp);

		const gas = await firma.Ibc.getGasEstimationTransfer(aliceWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimeStamp);
		const fee = Math.ceil(gas * 0.1);
		const metadata = "";

		const result = await firma.Ibc.transfer(aliceWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimeStamp, metadata, { gas: gas, fee: fee });
		expect(result.code).to.be.equal(0);
	});
});