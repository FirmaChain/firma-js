import { Registry, EncodeObject, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { fromBase64 } from '@cosmjs/encoding';
import { SignAndBroadcastOptions } from ".";
import { SignDoc, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { SigningStargateClient, StargateClient, DeliverTxResponse, SignerData } from "@cosmjs/stargate";
import { FirmaWalletService } from "../../FirmaWalletService";

export class ITxClient {
  private rawWallet: DirectSecp256k1Wallet;

  constructor(
    private readonly wallet: FirmaWalletService,
    private readonly serverUrl: string,
    private readonly registry: Registry
  ) {
    this.rawWallet = wallet.getRawWallet();
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  async sign(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<TxRaw> {
    if (this.wallet.isLedger()) {
      return this.wallet.signLedger(msgs, { fee, memo }, this.registry);
    } else {
      const client = await SigningStargateClient.connectWithSigner(this.serverUrl, this.rawWallet, {
        registry: this.registry,
      });

      const [account] = await this.rawWallet.getAccounts();
      const accountData = await client.getAccount(account.address);
      const chainId = await client.getChainId();

      if (!accountData) throw new Error("Account data not found");

      const signerData: SignerData = {
        accountNumber: accountData.accountNumber,
        sequence: accountData.sequence,
        chainId: chainId,
      };

      return await client.sign(account.address, msgs, fee, memo, signerData);
    }
  }

  async broadcast(txRaw: TxRaw): Promise<DeliverTxResponse> {
    const client = await StargateClient.connect(this.serverUrl);
    const txBytes = TxRaw.encode(txRaw).finish();
    return await client.broadcastTx(txBytes);
  }

  async broadcastTxBytes(txBytes: Uint8Array): Promise<DeliverTxResponse> {
    const client = await StargateClient.connect(this.serverUrl);
    return await client.broadcastTx(txBytes);
  }

  // sign() → broadcast()
  async signAndBroadcast(msgs: EncodeObject[], { fee, memo }: SignAndBroadcastOptions): Promise<DeliverTxResponse> {
    const txRaw = await this.sign(msgs, { fee, memo });
    return await this.broadcast(txRaw);
  }

  public async signDirectForSignDoc(signerAddress: string, signDoc: SignDoc): Promise<DeliverTxResponse> {
    const signatureResponse = await this.rawWallet.signDirect(signerAddress, signDoc);

    const txRaw: TxRaw = TxRaw.fromPartial({
      bodyBytes: signDoc.bodyBytes,
      authInfoBytes: signDoc.authInfoBytes,
      signatures: [fromBase64(signatureResponse.signature.signature)],
    });

    return await this.broadcast(txRaw);
  }
}
