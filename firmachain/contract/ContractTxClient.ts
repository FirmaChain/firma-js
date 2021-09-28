import { Registry, EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { MsgCreateContractFile, MsgAddContractLog } from "./ContractTxTypes";
import { ITxClient } from "../common/ITxClient";

const types = [
  ["/firmachain.firmachain.contract.MsgCreateContractFile", MsgCreateContractFile],
  ["/firmachain.firmachain.contract.MsgAddContractLog", MsgAddContractLog],
];

const registry = new Registry(<any>types);

interface MsgAddContractLogEncodeObject extends EncodeObject {
  readonly typeUrl: "/firmachain.firmachain.contract.MsgAddContractLog";
  readonly value: Partial<MsgAddContractLog>;
}

interface MsgCreateContractFileEncodeObject extends EncodeObject {
  readonly typeUrl: "/firmachain.firmachain.contract.MsgCreateContractFile";
  readonly value: Partial<MsgCreateContractFile>;
}

export class ContractTxClient extends ITxClient {

  constructor(_wallet: OfflineDirectSigner, _addr: string) {
    super(_wallet, _addr, registry);
  }

  public msgAddContractLog(data: MsgAddContractLog): MsgAddContractLogEncodeObject {
    return { typeUrl: "/firmachain.firmachain.contract.MsgAddContractLog", value: data };
  }

  public msgCreateContractFile(data: MsgCreateContractFile): MsgCreateContractFileEncodeObject {
    return { typeUrl: "/firmachain.firmachain.contract.MsgCreateContractFile", value: data };
  }
}