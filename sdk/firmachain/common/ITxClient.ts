import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { SignAndBroadcastOptions } from ".";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { SigningStargateClient } from "./signingstargateclient";
import { BroadcastTxResponse } from "./stargateclient";

export class ITxClient {

    constructor(private readonly wallet: OfflineDirectSigner,
        private readonly serverUrl: string,
        private readonly registry: Registry) {
    }

    async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {

        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.wallet, this.registry);
        const address = (await this.wallet.getAccounts())[0].address;

        return await client.sign(address, msgs, fee, memo);
    }

    async broadcast(txRaw: TxRaw): Promise<BroadcastTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.wallet, this.registry);
        const txBytes = TxRaw.encode(txRaw).finish();

        return await client.broadcastTx(txBytes);
    }

    async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<BroadcastTxResponse> {
        return await this.broadcast(await this.sign(msgs, { fee, memo }));
    }
}