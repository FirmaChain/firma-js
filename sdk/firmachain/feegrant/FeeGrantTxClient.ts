import { Registry, OfflineDirectSigner, EncodeObject } from "@cosmjs/proto-signing";
import { MsgGrantAllowance, MsgRevokeAllowance } from "./FeeGrantTxTypes";
import { ITxClient } from "../common/ITxClient";

import _m0 from "protobufjs/minimal";

const types = [
  ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", MsgGrantAllowance],
  ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", MsgRevokeAllowance]
];

const registry = new Registry(<any>types);

interface MsgGrantAllowanceEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance";
  readonly value: Partial<MsgGrantAllowance>;
}

interface MsgRevokeAllowanceEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance";
  readonly value: Partial<MsgRevokeAllowance>;
}

export class FeeGrantTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgGrantAllowance(data: MsgGrantAllowance): MsgGrantAllowanceEncodeObject {
    return { typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance", value: data };
  }

  public msgRevokeAllowance(data: MsgRevokeAllowance): MsgRevokeAllowanceEncodeObject {
    return { typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance", value: data };
  }
}