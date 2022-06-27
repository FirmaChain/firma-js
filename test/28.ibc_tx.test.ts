import { expect } from 'chai';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import Long from 'long';
import { FirmaSDK } from "../sdk/FirmaSDK"
import { FirmaUtil } from '../sdk/FirmaUtil';
import { aliceMnemonic, bobMnemonic, TestChainConfig } from './config_test';

describe('[28. IBC Tx Test]', () => {

	const firma = new FirmaSDK(TestChainConfig);

	it('IBC transfer', async () => {
		let aliceWallet = await firma.Wallet.fromMnemonic(aliceMnemonic);
		
		const sourcePort = "transfer";
		const sourceChannel = "channel-3";
		const denom = "ufct";
		const amount = "1000000";
		const receiver = "firma1320eclh4dwzx89qjap2q5n2hna07zs2vm8tzlu";

		// new by dh
		// https://explorer-testnet.firmachain.dev/transactions/B4245412560A108F7C987DF08C05A748278706E045B14961CE61E86786659592

		// old by cli
		// https://explorer-testnet.firmachain.dev/transactions/49FC4BBC973B72383DBCE9305DAC320B534814A539808FB6B20E9BC5A831C269

		// There're two ways to set timeout values (height vs timestamp)

		let clientState = await firma.Ibc.getClientState(sourceChannel, sourcePort);
		//console.log(clientState);

		let revison_height = clientState.identified_client_state.client_state.latest_height.revision_height;
		let revison_number = clientState.identified_client_state.client_state.latest_height.revision_number;

		// ways : 1
		// Set target revision height : get revision height and add 1000 block (cli tx policy)
		// issues: because of ibc version difference, can't get revision info directly.
		const height: Height = Height.fromPartial({
			revisionHeight: Long.fromString(revison_height, true).add(Long.fromNumber(1000)),
			revisionNumber: Long.fromString(revison_number, true),
		});

		// ways : 2
		// for nano second(000000) and add 10min(600000) for timeout
		var timeStamp = (Date.now() + 600000).toString() + "000000";

		const timeoutTimeStamp = Long.fromString(timeStamp, true);
		//console.log(timeStamp);

		const gas = await firma.Ibc.getGasEstimationTransfer(aliceWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimeStamp);
		const fee = FirmaUtil.getUFCTFromFCT(gas * 0.1);

		var result = await firma.Ibc.transfer(aliceWallet, sourcePort, sourceChannel, denom, amount, receiver, height, timeoutTimeStamp,  { gas: gas, fee: fee });
		//console.log(result);
	});
});