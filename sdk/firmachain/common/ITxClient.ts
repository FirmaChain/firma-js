import { Registry, EncodeObject } from "@cosmjs/proto-signing";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

import { SignAndBroadcastOptions } from ".";
import { SignDoc, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { FirmaWalletService } from "../../FirmaWalletService";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { SigningStargateClient, TxRawExt } from "./signingstargateclient";

export class ITxClient {

    private rawWallet: DirectSecp256k1Wallet;

    constructor(private readonly wallet: FirmaWalletService,
        private readonly serverUrl: string,
        private readonly registry: Registry) {

        this.rawWallet = wallet.getRawWallet();
    }

    public getRegistry(): Registry { return this.registry; }

    async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {
        
        if (this.wallet.isLedger()) {
            return this.wallet.signLedger(msgs, { fee, memo }, this.registry);
        } else {
            const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
            const address = (await this.rawWallet.getAccounts())[0].address;
    
            return await client.sign(address, msgs, fee, memo);
        }
    }

    async broadcast(txRaw: TxRaw): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        const txBytes = TxRaw.encode(txRaw).finish();

        return await client.broadcastTx(txBytes);
    }

    async broadcastTxBytes(txBytes: Uint8Array): Promise<DeliverTxResponse> {
        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        return await client.broadcastTx(txBytes);
    }

    async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<DeliverTxResponse> {
        return await this.broadcast(await this.sign(msgs, { fee, memo }));
    }

    public async signDirectForSignDoc(signerAddress: string, signDoc: SignDoc) : Promise<TxRawExt>{

        const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, { registry: this.registry });
        return await client.signDirectForSignDoc(signerAddress, signDoc);
    }

}