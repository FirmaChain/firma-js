import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { MsgSend, MsgMultiSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { ITxClient } from "../common/ITxClient";

const types = [
  ["/cosmos.bank.v1beta1.MsgSend", MsgSend],
  ["/cosmos.bank.v1beta1.MsgMultiSend", MsgMultiSend]
];

const registry = new Registry(<any>types);

interface MsgSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.bank.v1beta1.MsgSend";
  readonly value: Partial<MsgSend>;
}

interface MsgMultiSendEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend";
  readonly value: Partial<MsgMultiSend>;
}

export class BankTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgSend(data: MsgSend): MsgSendEncodeObject {
    return { typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: data };
  }

  public msgMultiSend(data: MsgMultiSend): MsgMultiSendEncodeObject {
    return { typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend", value: data };
  }
}