import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

import { SignAndBroadcastOptions } from ".";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { SigningStargateClient } from "./signingstargateclient";
import { BroadcastTxResponse } from "./stargateclient";
import { FirmaWalletService } from "../../FirmaWalletService";

export class ITxClient {

    private rawWallet: DirectSecp256k1Wallet;

    constructor(private readonly wallet: FirmaWalletService,
        private readonly serverUrl: string,
        private readonly registry: Registry) {

        this.rawWallet = wallet.getRawWallet();
    }

    async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {

        if (this.wallet.isLedger()) {
            return this.wallet.signLedger(msgs, { fee, memo }, this.registry);
        }
        else {

            const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, this.registry);
            const address = (await this.rawWallet.getAccounts())[0].address;

            return await client.sign(address, msgs, fee, memo);
        }
    }

    async broadcast(txRaw: TxRaw): Promise<BroadcastTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, this.registry);
        const txBytes = TxRaw.encode(txRaw).finish();

        return await client.broadcastTx(txBytes);
    }

    async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<BroadcastTxResponse> {
        return await this.broadcast(await this.sign(msgs, { fee, memo }));
    }
}