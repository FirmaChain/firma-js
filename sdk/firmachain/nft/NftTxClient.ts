import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgTransfer, MsgMint, MsgBurn } from "./NftTxTypes";
import { ITxClient } from "../common/ITxClient";

const types = [
  ["/firmachain.firmachain.nft.MsgTransfer", MsgTransfer],
  ["/firmachain.firmachain.nft.MsgMint", MsgMint],
  ["/firmachain.firmachain.nft.MsgBurn", MsgBurn],
];

const registry = new Registry(<any>types);

interface MsgTransferEncodeObject extends EncodeObject {
  readonly typeUrl: "/firmachain.firmachain.nft.MsgTransfer";
  readonly value: Partial<MsgTransfer>;
}

interface MsgMintEncodeObject extends EncodeObject {
  readonly typeUrl: "/firmachain.firmachain.nft.MsgMint";
  readonly value: Partial<MsgMint>;
}

interface MsgBurnEncodeObject extends EncodeObject {
  readonly typeUrl: "/firmachain.firmachain.nft.MsgBurn";
  readonly value: Partial<MsgBurn>;
}

export class NftTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgTransfer(data: MsgTransfer): MsgTransferEncodeObject {
    return { typeUrl: "/firmachain.firmachain.nft.MsgTransfer", value: data };
  }

  public msgMint(data: MsgMint): MsgMintEncodeObject {
    return { typeUrl: "/firmachain.firmachain.nft.MsgMint", value: data };
  }

  public msgBurn(data: MsgBurn): MsgBurnEncodeObject {
    return { typeUrl: "/firmachain.firmachain.nft.MsgBurn", value: data };
  }
}