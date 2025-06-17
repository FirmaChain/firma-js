import { AminoMsg, decodeSignature, encodeSecp256k1Pubkey, encodeSecp256k1Signature, isSecp256k1Pubkey, makeSignDoc as makeSignDocAmino, makeStdTx, OfflineAminoSigner, rawSecp256k1PubkeyToRawAddress, serializeSignDoc, StdFee, StdTx } from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, fromBech32, toBase64 } from "@cosmjs/encoding";
import { Int53, Uint53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  GeneratedType,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import { CometClient, connectComet, HttpEndpoint } from "@cosmjs/tendermint-rpc";
import { arrayContentEquals, assert, assertDefined, isNonNullObject } from "@cosmjs/utils";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgDelegate, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { SignDoc, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { Height } from "cosmjs-types/ibc/core/client/v1/client";
import equals from "fast-deep-equal";

import { AminoConverters, AminoTypes } from "./aminotypes";
import { calculateFee, GasPrice } from "./fee";
import {
  authzTypes,
  bankTypes,
  distributionTypes,
  feegrantTypes,
  govTypes,
  groupTypes,
  ibcTypes,
  MsgDelegateEncodeObject,
  MsgSendEncodeObject,
  MsgTransferEncodeObject,
  MsgUndelegateEncodeObject,
  MsgWithdrawDelegatorRewardEncodeObject,
  stakingTypes,
  vestingTypes,
} from "./modules";
import {
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
} from "./modules";
import { DeliverTxResponse, StargateClient, StargateClientOptions } from "./stargateclient";
import { FirmaUtil } from "../../FirmaUtil";

export const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.base.v1beta1.Coin", Coin],
  ...authzTypes,
  ...bankTypes,
  ...distributionTypes,
  ...feegrantTypes,
  ...govTypes,
  ...groupTypes,
  ...stakingTypes,
  ...ibcTypes,
  ...vestingTypes,
];

export interface ArbitraryVerifyData{
  type: string
  signer: string;
  data: string;
  pubkey: string;
  signature: string;
}

/**
 * Signing information for a single signer that is not included in the transaction.
 *
 * @see https://github.com/cosmos/cosmos-sdk/blob/v0.42.2/x/auth/signing/sign_mode_handler.go#L23-L37
 */
export interface SignerData {
  readonly accountNumber: number;
  readonly sequence: number;
  readonly chainId: string;
}

/** Use for testing only */
export interface PrivateSigningStargateClient {
  readonly registry: Registry;
}

export interface SigningStargateClientOptions extends StargateClientOptions {
  readonly registry?: Registry;
  readonly aminoTypes?: AminoTypes;
  readonly broadcastTimeoutMs?: number;
  readonly broadcastPollIntervalMs?: number;
  readonly gasPrice?: GasPrice;
}

export function createDefaultAminoConverters(): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
  };
}

export interface MsgSignData extends AminoMsg {
  readonly type: "sign/MsgSignData";
  readonly value: {
      /** Bech32 account address */
      signer: string;
      /** Base64 encoded data */
      data: string;
  };
}

export function isMsgSignData(msg: AminoMsg): msg is MsgSignData {
  const castedMsg = msg as MsgSignData;
  if (castedMsg.type !== "sign/MsgSignData") return false;
  if (!isNonNullObject(castedMsg.value)) return false;
  if (typeof castedMsg.value.signer !== "string") return false;
  if (typeof castedMsg.value.data !== "string") return false;
  return true;
}

export class SigningStargateClient extends StargateClient {
  public readonly registry: Registry;
  private chainId: string | undefined;

  public readonly broadcastTimeoutMs: number | undefined;
  public readonly broadcastPollIntervalMs: number | undefined;

  private readonly signer: OfflineSigner;
  private readonly aminoTypes: AminoTypes;
  private readonly gasPrice: GasPrice | undefined;
  // Starting with Cosmos SDK 0.47, we see many cases in which 1.3 is not enough anymore
  // E.g. https://github.com/cosmos/cosmos-sdk/issues/16020
  private readonly defaultGasMultiplier = 1.4;

  /**
   * Creates an instance by connecting to the given CometBFT RPC endpoint.
   *
   * This uses auto-detection to decide between a CometBFT 0.38, Tendermint 0.37 and 0.34 client.
   * To set the Comet client explicitly, use `createWithSigner`.
   */
  public static async connectWithSigner(
    endpoint: string | HttpEndpoint,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    const cometClient = await connectComet(endpoint);
    return SigningStargateClient.createWithSigner(cometClient, signer, options);
  }

  /**
   * Creates an instance from a manually created Comet client.
   * Use this to use `Comet38Client` or `Tendermint37Client` instead of `Tendermint34Client`.
   */
  public static async createWithSigner(
    cometClient: CometClient,
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    return new SigningStargateClient(cometClient, signer, options);
  }

  /**
   * Creates a client in offline mode.
   *
   * This should only be used in niche cases where you know exactly what you're doing,
   * e.g. when building an offline signing application.
   *
   * When you try to use online functionality with such a signer, an
   * exception will be raised.
   */
  public static async offline(
    signer: OfflineSigner,
    options: SigningStargateClientOptions = {},
  ): Promise<SigningStargateClient> {
    return new SigningStargateClient(undefined, signer, options);
  }

  protected constructor(
    cometClient: CometClient | undefined,
    signer: OfflineSigner,
    options: SigningStargateClientOptions,
  ) {
    super(cometClient, options);
    const {
      registry = new Registry(defaultRegistryTypes),
      aminoTypes = new AminoTypes(createDefaultAminoConverters()),
    } = options;
    this.registry = registry;
    this.aminoTypes = aminoTypes;
    this.signer = signer;
    this.broadcastTimeoutMs = options.broadcastTimeoutMs;
    this.broadcastPollIntervalMs = options.broadcastPollIntervalMs;
    this.gasPrice = options.gasPrice;
  }

  public async simulate(
    signerAddress: string,
    messages: readonly EncodeObject[],
    memo: string | undefined,
  ): Promise<number> {
    const anyMsgs = messages.map((m) => this.registry.encodeAsAny(m));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodeSecp256k1Pubkey(accountFromSigner.pubkey);
    const { sequence } = await this.getSequence(signerAddress);
    const { gasInfo } = await this.forceGetQueryClient().tx.simulate(anyMsgs, memo, pubkey, sequence);
    assertDefined(gasInfo);
    return Uint53.fromString(gasInfo.gasUsed.toString()).toNumber();
  }

  public async sendTokens(
    senderAddress: string,
    recipientAddress: string,
    amount: readonly Coin[],
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const sendMsg: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: senderAddress,
        toAddress: recipientAddress,
        amount: [...amount],
      },
    };
    return this.signAndBroadcast(senderAddress, [sendMsg], fee, memo);
  }

  public async delegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const delegateMsg: MsgDelegateEncodeObject = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: MsgDelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [delegateMsg], fee, memo);
  }

  public async undelegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const undelegateMsg: MsgUndelegateEncodeObject = {
      typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
      value: MsgUndelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [undelegateMsg], fee, memo);
  }

  public async withdrawRewards(
    delegatorAddress: string,
    validatorAddress: string,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const withdrawMsg: MsgWithdrawDelegatorRewardEncodeObject = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      value: MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
      }),
    };
    return this.signAndBroadcast(delegatorAddress, [withdrawMsg], fee, memo);
  }

  /**
   * @deprecated This API does not support setting the memo field of `MsgTransfer` (only the transaction memo).
   * We'll remove this method at some point because trying to wrap the various message types is a losing strategy.
   * Please migrate to `signAndBroadcast` with an `MsgTransferEncodeObject` created in the caller code instead.
   * @see https://github.com/cosmos/cosmjs/issues/1493
   */
  public async sendIbcTokens(
    senderAddress: string,
    recipientAddress: string,
    transferAmount: Coin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    /** timeout in seconds */
    timeoutTimestamp: number | undefined,
    fee: StdFee | "auto" | number,
    memo = "",
  ): Promise<DeliverTxResponse> {
    const timeoutTimestampNanoseconds = timeoutTimestamp
      ? BigInt(timeoutTimestamp) * BigInt(1_000_000_000)
      : undefined;
    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: MsgTransfer.fromPartial({
        sourcePort: sourcePort,
        sourceChannel: sourceChannel,
        sender: senderAddress,
        receiver: recipientAddress,
        token: transferAmount,
        timeoutHeight: timeoutHeight,
        timeoutTimestamp: timeoutTimestampNanoseconds,
      }),
    };
    return this.signAndBroadcast(senderAddress, [transferMsg], fee, memo);
  }

  public async signAndBroadcast(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee | "auto" | number,
    memo = "",
    timeoutHeight?: bigint,
  ): Promise<DeliverTxResponse> {
    let usedFee: StdFee;
    if (fee == "auto" || typeof fee === "number") {
      assertDefined(this.gasPrice, "Gas price must be set in the client options when auto gas is used.");
      const gasEstimation = await this.simulate(signerAddress, messages, memo);
      const multiplier = typeof fee === "number" ? fee : this.defaultGasMultiplier;
      usedFee = calculateFee(Math.round(gasEstimation * multiplier), this.gasPrice);
    } else {
      usedFee = fee;
    }
    const txRaw = await this.sign(signerAddress, messages, usedFee, memo, undefined, timeoutHeight);
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.broadcastTx(txBytes, this.broadcastTimeoutMs, this.broadcastPollIntervalMs);
  }

  /**
   * This method is useful if you want to send a transaction in broadcast,
   * without waiting for it to be placed inside a block, because for example
   * I would like to receive the hash to later track the transaction with another tool.
   * @returns Returns the hash of the transaction
   */
  public async signAndBroadcastSync(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee | "auto" | number,
    memo = "",
    timeoutHeight?: bigint,
  ): Promise<string> {
    let usedFee: StdFee;
    if (fee == "auto" || typeof fee === "number") {
      assertDefined(this.gasPrice, "Gas price must be set in the client options when auto gas is used.");
      const gasEstimation = await this.simulate(signerAddress, messages, memo);
      const multiplier = typeof fee === "number" ? fee : this.defaultGasMultiplier;
      usedFee = calculateFee(Math.round(gasEstimation * multiplier), this.gasPrice);
    } else {
      usedFee = fee;
    }
    const txRaw = await this.sign(signerAddress, messages, usedFee, memo, undefined, timeoutHeight);
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.broadcastTxSync(txBytes);
  }

  public static async makeSignDocForSend(
      signerAddress: string,
    pubkeyStr: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    serverUrl: string,
    chainId: string,
    registry: Registry
    ): Promise<SignDoc> {
    
      const client = await SigningStargateClient.connect(serverUrl);
      const { accountNumber, sequence } = await client.getSequence(signerAddress);
      const account = await client.getAccount(signerAddress);

      if(account == null)
          throw new Error("Failed to retrieve account from signer");

      const rawSecp256k1Pubkey = fromBase64(pubkeyStr);
      const pubkey = encodePubkey(encodeSecp256k1Pubkey(rawSecp256k1Pubkey));

      const txBodyEncodeObject: TxBodyEncodeObject = {
          typeUrl: "/cosmos.tx.v1beta1.TxBody",
          value: {
              messages: messages,
              memo: memo,
          },
      };

      const txBodyBytes = registry.encode(txBodyEncodeObject);
      const gasLimit = Int53.fromString(fee.gas).toNumber();
      const feePayer = signerAddress; 
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence }],
        fee.amount,
        gasLimit,
        fee.granter,
        feePayer
      );

      return makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
  }

  /**
   * Gets account number and sequence from the API, creates a sign doc,
   * creates a single signature and assembles the signed transaction.
   *
   * The sign mode (SIGN_MODE_DIRECT or SIGN_MODE_LEGACY_AMINO_JSON) is determined by this client's signer.
   *
   * You can pass signer data (account number, sequence and chain ID) explicitly instead of querying them
   * from the chain. This is needed when signing for a multisig account, but it also allows for offline signing
   * (See the SigningStargateClient.offline constructor).
   */
  public async sign(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData,
    timeoutHeight?: bigint,
  ): Promise<TxRaw> {
    let signerData: SignerData;
    if (explicitSignerData) {
      signerData = explicitSignerData;
    } else {
      const { accountNumber, sequence } = await this.getSequence(signerAddress);
      const chainId = await this.getChainId();
      signerData = {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: chainId,
      };
    }

    return isOfflineDirectSigner(this.signer)
      ? this.signDirect(signerAddress, messages, fee, memo, signerData, timeoutHeight)
      : this.signAmino(signerAddress, messages, fee, memo, signerData, timeoutHeight);
  }

  async getChainId(): Promise<string> {
    if (!this.chainId) {
        const response = await this.forceGetCometClient().status();
        const chainId = response.nodeInfo.network;
        if (!chainId) throw new Error("Chain ID must not be empty");
        this.chainId = chainId;
    }

    return this.chainId!;
  }

  private async signAmino(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData,
    timeoutHeight?: bigint,
  ): Promise<TxRaw> {
    assert(!isOfflineDirectSigner(this.signer));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const msgs = messages.map((msg) => this.aminoTypes.toAmino(msg));
    const signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence, timeoutHeight);
    const { signature, signed } = await this.signer.signAmino(signerAddress, signDoc);
    const signedTxBody = {
      messages: signed.msgs.map((msg) => this.aminoTypes.fromAmino(msg)),
      memo: signed.memo,
      timeoutHeight: timeoutHeight,
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
    const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signed.sequence).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signed.fee.amount,
      signedGasLimit,
      signed.fee.granter,
      signed.fee.payer,
      signMode,
    );
    return TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private async signDirect(
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData,
    timeoutHeight?: bigint,
  ): Promise<TxRaw> {
    assert(isOfflineDirectSigner(this.signer));
    const accountFromSigner = (await this.signer.getAccounts()).find(
      (account) => account.address === signerAddress,
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
    const txBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: messages,
        memo: memo,
        timeoutHeight: timeoutHeight,
      },
    };
    const txBodyBytes = this.registry.encode(txBodyEncodeObject);
    const gasLimit = Int53.fromString(fee.gas).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      fee.amount,
      gasLimit,
      fee.granter,
      fee.payer,
    );
    const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
    const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);
    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  static async experimentalAdr36Verify(data: ArbitraryVerifyData, checkMsg: string): Promise<boolean> {

    let newSignature = encodeSecp256k1Signature(FirmaUtil.base64ToArrayBuffer(data.pubkey), FirmaUtil.base64ToArrayBuffer(data.signature));

    let signed: StdTx = {
  fee: {
    gas: "0",
    amount: [],
  },
  msg: [{
    type: data.type,
    value: {signer: data.signer, data: data.data}
  }],
  signatures: [newSignature],
  memo: ""
}

    // Restrictions from ADR-036
    if (signed.memo !== "") throw new Error("Memo must be empty.");
    if (signed.fee.gas !== "0") throw new Error("Fee gas must 0.");
    if (signed.fee.amount.length !== 0) throw new Error("Fee amount must be an empty array.");

    const accountNumber = 0;
    const sequence = 0;
    const chainId = "";

    // Check `msg` array
    const signedMessages = signed.msg;
    if (!signedMessages.every(isMsgSignData)) {
        throw new Error(`Found message that is not the expected type.`);
    }
    if (signedMessages.length === 0) {
        throw new Error("No message found. Without messages we cannot determine the signer address.");
    }

    // msg error check.

    const sourceMsg = Buffer.from(signedMessages[0].value.data, 'base64').toString();

    if (sourceMsg !== checkMsg) {
        throw new Error("Different Msg error. source:" + sourceMsg + ", target:" + checkMsg);
    }

    // TODO: restrict number of messages?

    const signatures = signed.signatures;
    if (signatures.length !== 1) throw new Error("Must have exactly one signature to be supported.");
    const signature = signatures[0];
    if (!isSecp256k1Pubkey(signature.pub_key)) {
        throw new Error("Only secp256k1 signatures are supported.");
    }

    const signBytes = serializeSignDoc(
        makeSignDocAmino(signed.msg, signed.fee, chainId, signed.memo, accountNumber, sequence),
    );
    const prehashed = sha256(signBytes);

    const secpSignature = Secp256k1Signature.fromFixedLength(fromBase64(signature.signature));
    const rawSecp256k1Pubkey = fromBase64(signature.pub_key.value);
    const rawSignerAddress = rawSecp256k1PubkeyToRawAddress(rawSecp256k1Pubkey);

    if (
        signedMessages.some(
            (msg) => !arrayContentEquals(fromBech32(msg.value.signer).data, rawSignerAddress),
        )
    ) {
        throw new Error("Found mismatch between signer in message and public key");
    }

    const ok = await Secp256k1.verifySignature(secpSignature, prehashed, rawSecp256k1Pubkey);
    return ok;
  }

  public async experimentalAdr36Sign(signerAddress: string, data: Uint8Array | Uint8Array[]): Promise<ArbitraryVerifyData> {
        const accountNumber = 0;
        const sequence = 0;
        const chainId = "";
        const fee: StdFee = {
            gas: "0",
            amount: [],
            //granter: "" // added by DH
        };
        const memo = "";

        const datas = Array.isArray(data) ? data : [data];

        const msgs: MsgSignData[] = datas.map(
            (d): MsgSignData => ({
                type: "sign/MsgSignData",
                value: {
                    signer: signerAddress,
                    data: toBase64(d),
                },
            }),
        );

        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );

        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }

        if (!("signAmino" in this.signer)) {
          throw new Error("The signer does not support signAmino. Please use an OfflineAminoSigner instance.");
        }

        let signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence);
        const { signature, signed } = await (this.signer as OfflineAminoSigner).signAmino(signerAddress, signDoc);

        if (!equals(signDoc, signed)) {
            throw new Error(
                "The signed document differs from the signing instruction. This is not supported for ADR-036."
            );
        }

        let signatureResult = makeStdTx(signDoc, signature);

        let decodeData = decodeSignature(signatureResult.signatures[0]);

		let jsonData = {
			type: "sign/MsgSignData",
            signer: signatureResult.msg[0].value.signer,
            data: signatureResult.msg[0].value.data,
			pubkey: FirmaUtil.arrayBufferToBase64(decodeData.pubkey),
			signature: FirmaUtil.arrayBufferToBase64(decodeData.signature)
		}

		return jsonData;
    }
}

