import { Reader, Writer } from "protobufjs/minimal";

export const protobufPackage = "firmachain.firmachain.token";

export interface MsgCreateToken {
  owner: string;
  name: string;
  symbol: string;
  tokenURI: string;
  totalSupply: number;
  decimal: number;
  mintable: boolean;
  burnable: boolean;
}

export interface MsgCreateTokenResponse {}

export interface MsgMint {
  owner: string;
  tokenID: string;
  amount: number;
  toAddress: string;
}

export interface MsgMintResponse {}

export interface MsgBurn {
  owner: string;
  tokenID: string;
  amount: number;
}

export interface MsgBurnResponse {}

export interface MsgUpdateTokenURI {
  owner: string;
  tokenID: string;
  tokenURI: string;
}

export interface MsgUpdateTokenURIResponse {}

const baseMsgCreateToken: object = {
  owner: "",
  name: "",
  symbol: "",
  tokenURI: "",
  totalSupply: 0,
  decimal: 0,
  mintable: false,
  burnable: false,
};

export const MsgCreateToken = {
  encode(message: MsgCreateToken, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.symbol !== "") {
      writer.uint32(26).string(message.symbol);
    }
    if (message.tokenURI !== "") {
      writer.uint32(34).string(message.tokenURI);
    }
    if (message.totalSupply !== 0) {
      writer.uint32(40).uint64(message.totalSupply);
    }
    if (message.decimal !== 0) {
      writer.uint32(48).uint64(message.decimal);
    }
    if (message.mintable === true) {
      writer.uint32(56).bool(message.mintable);
    }
    if (message.burnable === true) {
      writer.uint32(64).bool(message.burnable);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateToken {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgCreateToken } as MsgCreateToken;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.name = reader.string();
          break;
        case 3:
          message.symbol = reader.string();
          break;
        case 4:
          message.tokenURI = reader.string();
          break;
        case 5:
          message.totalSupply = longToNumber(reader.uint64() as Long);
          break;
        case 6:
          message.decimal = longToNumber(reader.uint64() as Long);
          break;
        case 7:
          message.mintable = reader.bool();
          break;
        case 8:
          message.burnable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateToken {
    const message = { ...baseMsgCreateToken } as MsgCreateToken;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = "";
    }
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = String(object.symbol);
    } else {
      message.symbol = "";
    }
    if (object.tokenURI !== undefined && object.tokenURI !== null) {
      message.tokenURI = String(object.tokenURI);
    } else {
      message.tokenURI = "";
    }
    if (object.totalSupply !== undefined && object.totalSupply !== null) {
      message.totalSupply = Number(object.totalSupply);
    } else {
      message.totalSupply = 0;
    }
    if (object.decimal !== undefined && object.decimal !== null) {
      message.decimal = Number(object.decimal);
    } else {
      message.decimal = 0;
    }
    if (object.mintable !== undefined && object.mintable !== null) {
      message.mintable = Boolean(object.mintable);
    } else {
      message.mintable = false;
    }
    if (object.burnable !== undefined && object.burnable !== null) {
      message.burnable = Boolean(object.burnable);
    } else {
      message.burnable = false;
    }
    return message;
  },

  toJSON(message: MsgCreateToken): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.name !== undefined && (obj.name = message.name);
    message.symbol !== undefined && (obj.symbol = message.symbol);
    message.tokenURI !== undefined && (obj.tokenURI = message.tokenURI);
    message.totalSupply !== undefined &&
      (obj.totalSupply = message.totalSupply);
    message.decimal !== undefined && (obj.decimal = message.decimal);
    message.mintable !== undefined && (obj.mintable = message.mintable);
    message.burnable !== undefined && (obj.burnable = message.burnable);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateToken>): MsgCreateToken {
    const message = { ...baseMsgCreateToken } as MsgCreateToken;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = "";
    }
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = object.symbol;
    } else {
      message.symbol = "";
    }
    if (object.tokenURI !== undefined && object.tokenURI !== null) {
      message.tokenURI = object.tokenURI;
    } else {
      message.tokenURI = "";
    }
    if (object.totalSupply !== undefined && object.totalSupply !== null) {
      message.totalSupply = object.totalSupply;
    } else {
      message.totalSupply = 0;
    }
    if (object.decimal !== undefined && object.decimal !== null) {
      message.decimal = object.decimal;
    } else {
      message.decimal = 0;
    }
    if (object.mintable !== undefined && object.mintable !== null) {
      message.mintable = object.mintable;
    } else {
      message.mintable = false;
    }
    if (object.burnable !== undefined && object.burnable !== null) {
      message.burnable = object.burnable;
    } else {
      message.burnable = false;
    }
    return message;
  },
};

const baseMsgCreateTokenResponse: object = {};

export const MsgCreateTokenResponse = {
  encode(_: MsgCreateTokenResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateTokenResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgCreateTokenResponse } as MsgCreateTokenResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgCreateTokenResponse {
    const message = { ...baseMsgCreateTokenResponse } as MsgCreateTokenResponse;
    return message;
  },

  toJSON(_: MsgCreateTokenResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgCreateTokenResponse>): MsgCreateTokenResponse {
    const message = { ...baseMsgCreateTokenResponse } as MsgCreateTokenResponse;
    return message;
  },
};

const baseMsgMint: object = {
  owner: "",
  tokenID: "",
  amount: 0,
  toAddress: "",
};

export const MsgMint = {
  encode(message: MsgMint, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.tokenID !== "") {
      writer.uint32(18).string(message.tokenID);
    }
    if (message.amount !== 0) {
      writer.uint32(24).uint64(message.amount);
    }
    if (message.toAddress !== "") {
      writer.uint32(34).string(message.toAddress);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgMint {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgMint } as MsgMint;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.tokenID = reader.string();
          break;
        case 3:
          message.amount = longToNumber(reader.uint64() as Long);
          break;
        case 4:
          message.toAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgMint {
    const message = { ...baseMsgMint } as MsgMint;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = String(object.tokenID);
    } else {
      message.tokenID = "";
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Number(object.amount);
    } else {
      message.amount = 0;
    }
    if (object.toAddress !== undefined && object.toAddress !== null) {
      message.toAddress = String(object.toAddress);
    } else {
      message.toAddress = "";
    }
    return message;
  },

  toJSON(message: MsgMint): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.tokenID !== undefined && (obj.tokenID = message.tokenID);
    message.amount !== undefined && (obj.amount = message.amount);
    message.toAddress !== undefined && (obj.toAddress = message.toAddress);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgMint>): MsgMint {
    const message = { ...baseMsgMint } as MsgMint;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = object.tokenID;
    } else {
      message.tokenID = "";
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    } else {
      message.amount = 0;
    }
    if (object.toAddress !== undefined && object.toAddress !== null) {
      message.toAddress = object.toAddress;
    } else {
      message.toAddress = "";
    }
    return message;
  },
};

const baseMsgMintResponse: object = {};

export const MsgMintResponse = {
  encode(_: MsgMintResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgMintResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgMintResponse } as MsgMintResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgMintResponse {
    const message = { ...baseMsgMintResponse } as MsgMintResponse;
    return message;
  },

  toJSON(_: MsgMintResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgMintResponse>): MsgMintResponse {
    const message = { ...baseMsgMintResponse } as MsgMintResponse;
    return message;
  },
};

const baseMsgBurn: object = { owner: "", tokenID: "", amount: 0 };

export const MsgBurn = {
  encode(message: MsgBurn, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.tokenID !== "") {
      writer.uint32(18).string(message.tokenID);
    }
    if (message.amount !== 0) {
      writer.uint32(24).uint64(message.amount);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgBurn {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgBurn } as MsgBurn;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.tokenID = reader.string();
          break;
        case 3:
          message.amount = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgBurn {
    const message = { ...baseMsgBurn } as MsgBurn;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = String(object.tokenID);
    } else {
      message.tokenID = "";
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Number(object.amount);
    } else {
      message.amount = 0;
    }
    return message;
  },

  toJSON(message: MsgBurn): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.tokenID !== undefined && (obj.tokenID = message.tokenID);
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgBurn>): MsgBurn {
    const message = { ...baseMsgBurn } as MsgBurn;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = object.tokenID;
    } else {
      message.tokenID = "";
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    } else {
      message.amount = 0;
    }
    return message;
  },
};

const baseMsgBurnResponse: object = {};

export const MsgBurnResponse = {
  encode(_: MsgBurnResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgBurnResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgBurnResponse } as MsgBurnResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgBurnResponse {
    const message = { ...baseMsgBurnResponse } as MsgBurnResponse;
    return message;
  },

  toJSON(_: MsgBurnResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgBurnResponse>): MsgBurnResponse {
    const message = { ...baseMsgBurnResponse } as MsgBurnResponse;
    return message;
  },
};

const baseMsgUpdateTokenURI: object = { owner: "", tokenID: "", tokenURI: "" };

export const MsgUpdateTokenURI = {
  encode(message: MsgUpdateTokenURI, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.tokenID !== "") {
      writer.uint32(18).string(message.tokenID);
    }
    if (message.tokenURI !== "") {
      writer.uint32(26).string(message.tokenURI);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateTokenURI {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgUpdateTokenURI } as MsgUpdateTokenURI;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.tokenID = reader.string();
          break;
        case 3:
          message.tokenURI = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateTokenURI {
    const message = { ...baseMsgUpdateTokenURI } as MsgUpdateTokenURI;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = String(object.tokenID);
    } else {
      message.tokenID = "";
    }
    if (object.tokenURI !== undefined && object.tokenURI !== null) {
      message.tokenURI = String(object.tokenURI);
    } else {
      message.tokenURI = "";
    }
    return message;
  },

  toJSON(message: MsgUpdateTokenURI): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.tokenID !== undefined && (obj.tokenID = message.tokenID);
    message.tokenURI !== undefined && (obj.tokenURI = message.tokenURI);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgUpdateTokenURI>): MsgUpdateTokenURI {
    const message = { ...baseMsgUpdateTokenURI } as MsgUpdateTokenURI;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.tokenID !== undefined && object.tokenID !== null) {
      message.tokenID = object.tokenID;
    } else {
      message.tokenID = "";
    }
    if (object.tokenURI !== undefined && object.tokenURI !== null) {
      message.tokenURI = object.tokenURI;
    } else {
      message.tokenURI = "";
    }
    return message;
  },
};

const baseMsgUpdateTokenURIResponse: object = {};

export const MsgUpdateTokenURIResponse = {
  encode(
    _: MsgUpdateTokenURIResponse,
    writer: Writer = Writer.create()
  ): Writer {
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number
  ): MsgUpdateTokenURIResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgUpdateTokenURIResponse,
    } as MsgUpdateTokenURIResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateTokenURIResponse {
    const message = {
      ...baseMsgUpdateTokenURIResponse,
    } as MsgUpdateTokenURIResponse;
    return message;
  },

  toJSON(_: MsgUpdateTokenURIResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<MsgUpdateTokenURIResponse>
  ): MsgUpdateTokenURIResponse {
    const message = {
      ...baseMsgUpdateTokenURIResponse,
    } as MsgUpdateTokenURIResponse;
    return message;
  },
};

/** Msg defines the Msg service. */
export interface Msg {
  CreateToken(request: MsgCreateToken): Promise<MsgCreateTokenResponse>;
  Mint(request: MsgMint): Promise<MsgMintResponse>;
  Burn(request: MsgBurn): Promise<MsgBurnResponse>;
  /** this line is used by starport scaffolding # proto/tx/rpc */
  UpdateTokenURI(
    request: MsgUpdateTokenURI
  ): Promise<MsgUpdateTokenURIResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }
  CreateToken(request: MsgCreateToken): Promise<MsgCreateTokenResponse> {
    const data = MsgCreateToken.encode(request).finish();
    const promise = this.rpc.request(
      "firmachain.firmachain.token.Msg",
      "CreateToken",
      data
    );
    return promise.then((data) =>
      MsgCreateTokenResponse.decode(new Reader(data))
    );
  }

  Mint(request: MsgMint): Promise<MsgMintResponse> {
    const data = MsgMint.encode(request).finish();
    const promise = this.rpc.request(
      "firmachain.firmachain.token.Msg",
      "Mint",
      data
    );
    return promise.then((data) => MsgMintResponse.decode(new Reader(data)));
  }

  Burn(request: MsgBurn): Promise<MsgBurnResponse> {
    const data = MsgBurn.encode(request).finish();
    const promise = this.rpc.request(
      "firmachain.firmachain.token.Msg",
      "Burn",
      data
    );
    return promise.then((data) => MsgBurnResponse.decode(new Reader(data)));
  }

  UpdateTokenURI(
    request: MsgUpdateTokenURI
  ): Promise<MsgUpdateTokenURIResponse> {
    const data = MsgUpdateTokenURI.encode(request).finish();
    const promise = this.rpc.request(
      "firmachain.firmachain.token.Msg",
      "UpdateTokenURI",
      data
    );
    return promise.then((data) =>
      MsgUpdateTokenURIResponse.decode(new Reader(data))
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}
