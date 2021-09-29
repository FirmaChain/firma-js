import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { SignAndBroadcastOptions } from "../common";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { SigningStargateClient } from "./signingstargateclient";
import { BroadcastTxResponse } from "./stargateclient";

export class ITxClient {

  constructor(private _wallet: OfflineDirectSigner, private _addr: string, private _registry: Registry) { }

  public async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {

    const client = await SigningStargateClient.connectWithSigner(this._addr, this._wallet, this._registry);
    const address = (await this._wallet.getAccounts())[0].address;

    return await client.sign(address, msgs, fee, memo);
  }

  public async broadcast(txRaw: TxRaw): Promise<BroadcastTxResponse> {
    const client = await SigningStargateClient.connectWithSigner(this._addr, this._wallet, this._registry);
    const txBytes = TxRaw.encode(txRaw).finish();

    return await client.broadcastTx(txBytes);
  }

  public async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<BroadcastTxResponse> {
    return await this.broadcast(await this.sign(msgs, { fee, memo }));
  }
}