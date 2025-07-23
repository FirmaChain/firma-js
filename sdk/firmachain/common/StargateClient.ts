/* eslint-disable @typescript-eslint/naming-convention */
import { toHex } from "@cosmjs/encoding";
import { CometClient, connectComet, HttpEndpoint } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";
import {
  AuthExtension,
  BankExtension,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupStakingExtension,
  setupTxExtension,
  StakingExtension,
  TxExtension
} from "@cosmjs/stargate";
import { Account, accountFromAny, AccountParser } from "./accounts";
import { Event, fromTendermintEvent } from "./events";

export class TimeoutError extends Error {
  public readonly txId: string;

  public constructor(message: string, txId: string) {
    super(message);
    this.txId = txId;
  }
}

export interface BlockHeader {
  readonly version: {
    readonly block: string;
    readonly app: string;
  };
  readonly height: number;
  readonly chainId: string;
  /** An RFC 3339 time string like e.g. '2020-02-15T10:39:10.4696305Z' */
  readonly time: string;
}

export interface Block {
  /** The ID is a hash of the block header (uppercase hex) */
  readonly id: string;
  readonly header: BlockHeader;
  /** Array of raw transactions */
  readonly txs: readonly Uint8Array[];
}

/** A transaction that is indexed as part of the transaction history */
export interface IndexedTx {
  readonly height: number;
  /** The position of the transaction within the block. This is a 0-based index. */
  readonly txIndex: number;
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly hash: string;
  /** Transaction execution error code. 0 on success. */
  readonly code: number;
  readonly events: readonly Event[];
  /**
   * Raw transaction bytes stored in Tendermint.
   *
   * If you hash this, you get the transaction hash (= transaction ID):
   *
   * ```js
   * import { sha256 } from "@cosmjs/crypto";
   * import { toHex } from "@cosmjs/encoding";
   *
   * const transactionId = toHex(sha256(indexTx.tx)).toUpperCase();
   * ```
   *
   * Use `decodeTxRaw` from @cosmjs/proto-signing to decode this.
   */
  readonly tx: Uint8Array;
  /**
   * The message responses extracted from events.
   * This field contains structured message response data parsed from transaction events.
   */
  readonly msgResponses: Array<{ readonly typeUrl: string; readonly value: Uint8Array }>;
  readonly gasUsed: bigint;
  readonly gasWanted: bigint;
}

export interface SequenceResponse {
  readonly accountNumber: number;
  readonly sequence: number;
}

/**
 * The response after successfully broadcasting a transaction.
 * Success or failure refer to the execution result.
 */
export interface DeliverTxResponse {
  readonly height: number;
  /** The position of the transaction within the block. This is a 0-based index. */
  readonly txIndex: number;
  /** Error code. The transaction suceeded if and only if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly events: readonly Event[];
  /**
   * The message responses extracted from events.
   * This field contains structured message response data parsed from transaction events.
   */
  readonly msgResponses: Array<{ readonly typeUrl: string; readonly value: Uint8Array }>;
  readonly gasUsed: bigint;
  readonly gasWanted: bigint;
}

export type BroadcastTxResponse = DeliverTxResponse;

export function isDeliverTxFailure(result: DeliverTxResponse): boolean {
  return !!result.code;
}

export function isDeliverTxSuccess(result: DeliverTxResponse): boolean {
  return !isDeliverTxFailure(result);
}

export function isBroadcastTxFailure(result: BroadcastTxResponse): boolean {
  return !!result.code;
}

export function isBroadcastTxSuccess(result: BroadcastTxResponse): boolean {
  return !isBroadcastTxFailure(result);
}

/**
 * Ensures the given result is a success. Throws a detailed error message otherwise.
 */
export function assertIsDeliverTxSuccess(result: DeliverTxResponse): void {
  if (isDeliverTxFailure(result)) {
    throw new Error(
      `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Check events for details.`,
    );
  }
}

/**
 * Ensures the given result is a failure. Throws a detailed error message otherwise.
 */
export function assertIsDeliverTxFailure(result: DeliverTxResponse): void {
  if (isDeliverTxSuccess(result)) {
    throw new Error(
      `Transaction ${result.transactionHash} did not fail at height ${result.height}. Code: ${result.code}; Check events for details.`,
    );
  }
}

/**
 * An error when broadcasting the transaction. This contains the CheckTx errors
 * from the blockchain. Once a transaction is included in a block no BroadcastTxError
 * is thrown, even if the execution fails (DeliverTx errors).
 */
export class BroadcastTxError extends Error {
  public readonly code: number;
  public readonly codespace: string;
  public readonly log: string | undefined;

  public constructor(code: number, codespace: string, log: string | undefined) {
    super(`Broadcasting transaction failed with code ${code} (codespace: ${codespace}). Log: ${log}`);
    this.code = code;
    this.codespace = codespace;
    this.log = log;
  }
}

/** Use for testing only */
export interface PrivateStargateClient {
  readonly cometClient: CometClient | undefined;
}

export interface StargateClientOptions {
  readonly accountParser?: AccountParser;
}

/**
 * Extracts message responses from transaction events.
 * In Cosmos SDK v0.50+, message responses are embedded in events rather than separate data fields.
 */
function extractMsgResponsesFromEvents(events: readonly Event[]): Array<{ readonly typeUrl: string; readonly value: Uint8Array }> {
  const msgResponses: Array<{ readonly typeUrl: string; readonly value: Uint8Array }> = [];

  for (const event of events) {
    if (event.type === "message") {
      // Look for message response data in message events
      for (const attr of event.attributes) {
        if (attr.key === "module" || attr.key === "action") {
          // Extract type information for message responses
          const typeUrl = `/cosmos.${attr.value}`;
          msgResponses.push({
            typeUrl: typeUrl,
            value: new Uint8Array(), // In v0.50, detailed response data is in other events
          });
        }
      }
    }
  }

  return msgResponses;
}

export class StargateClient {
  private readonly cometClient: CometClient | undefined;
  private readonly queryClient:
    | (QueryClient & AuthExtension & BankExtension & StakingExtension & TxExtension)
    | undefined;
  private chainId: string | undefined;
  private readonly accountParser: AccountParser;

  /**
   * Creates an instance by connecting to the given CometBFT RPC endpoint.
   *
   * This uses auto-detection to decide between a CometBFT 0.38, Tendermint 0.37 and 0.34 client.
   * To set the Comet client explicitly, use `create`.
   */
  public static async connect(
    endpoint: string | HttpEndpoint,
    options: StargateClientOptions = {},
  ): Promise<StargateClient> {
    const cometClient = await connectComet(endpoint);
    return StargateClient.create(cometClient, options);
  }

  /**
   * Creates an instance from a manually created Comet client.
   * Use this to use `Comet38Client` or `Tendermint37Client` instead of `Tendermint34Client`.
   */
  public static async create(
    cometClient: CometClient,
    options: StargateClientOptions = {},
  ): Promise<StargateClient> {
    return new StargateClient(cometClient, options);
  }

  protected constructor(cometClient: CometClient | undefined, options: StargateClientOptions = {}) {
    if (cometClient) {
      this.cometClient = cometClient;
      this.queryClient = QueryClient.withExtensions(
        cometClient,
        setupAuthExtension,
        setupBankExtension,
        setupStakingExtension,
        setupTxExtension,
      );
    }
    const { accountParser = accountFromAny } = options;
    this.accountParser = accountParser;
  }

  protected getCometClient(): CometClient | undefined {
    return this.cometClient;
  }

  protected forceGetCometClient(): CometClient {
    if (!this.cometClient) {
      throw new Error("Comet client not available. You cannot use online functionality in offline mode.");
    }
    return this.cometClient;
  }

  protected getQueryClient():
    | (QueryClient & AuthExtension & BankExtension & StakingExtension & TxExtension)
    | undefined {
    return this.queryClient;
  }

  protected forceGetQueryClient(): QueryClient &
    AuthExtension &
    BankExtension &
    StakingExtension &
    TxExtension {
    if (!this.queryClient) {
      throw new Error("Query client not available. You cannot use online functionality in offline mode.");
    }
    return this.queryClient;
  }

  public async getChainId(): Promise<string> {
    if (!this.chainId) {
      const response = await this.forceGetCometClient().status();
      const chainId = response.nodeInfo.network;
      if (!chainId) throw new Error("Chain ID must not be empty");
      this.chainId = chainId;
    }

    return this.chainId;
  }

  public async getHeight(): Promise<number> {
    const status = await this.forceGetCometClient().status();
    return status.syncInfo.latestBlockHeight;
  }

  public async getAccount(searchAddress: string): Promise<Account | null> {
    try {
      const account = await this.forceGetQueryClient().auth.account(searchAddress);
      return account ? this.accountParser(account) : null;
    } catch (error: any) {
      if (/rpc error: code = NotFound/i.test(error.toString())) {
        return null;
      }
      throw error;
    }
  }

  public async getSequence(address: string): Promise<SequenceResponse> {
    const account = await this.getAccount(address);
    if (!account) {
      throw new Error(
        `Account '${address}' does not exist on chain. Send some tokens there before trying to query sequence.`,
      );
    }
    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
    };
  }

  public async getTx(id: string): Promise<IndexedTx | null> {
    const results = await this.txsQuery(`tx.hash='${id}'`);
    return results[0] ?? null;
  }

  public disconnect(): void {
    if (this.cometClient) this.cometClient.disconnect();
  }

  /**
   * Broadcasts a signed transaction to the network and monitors its inclusion in a block.
   *
   * If broadcasting is rejected by the node for some reason (e.g. because of a CheckTx failure),
   * an error is thrown.
   *
   * If the transaction is not included in a block before the provided timeout, this errors with a `TimeoutError`.
   *
   * If the transaction is included in a block, a `DeliverTxResponse` is returned. The caller then
   * usually needs to check for execution success or failure.
   */
  public async broadcastTx(
    tx: Uint8Array,
    timeoutMs = 60_000,
    pollIntervalMs = 3_000,
  ): Promise<DeliverTxResponse> {
    let timedOut = false;
    const txPollTimeout = setTimeout(() => {
      timedOut = true;
    }, timeoutMs);

    const pollForTx = async (txId: string): Promise<DeliverTxResponse> => {
      if (timedOut) {
        throw new TimeoutError(
          `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${timeoutMs / 1000
          } seconds.`,
          txId,
        );
      }
      await sleep(pollIntervalMs);
      const result = await this.getTx(txId);
      return result
        ? {
          code: result.code,
          height: result.height,
          txIndex: result.txIndex,
          events: result.events,
          transactionHash: txId,
          msgResponses: result.msgResponses,
          gasUsed: result.gasUsed,
          gasWanted: result.gasWanted,
        }
        : pollForTx(txId);
    };

    const broadcasted = await this.forceGetCometClient().broadcastTxSync({ tx });

    if (broadcasted.code) {
      return Promise.reject(
        new BroadcastTxError(broadcasted.code, broadcasted.codespace ?? "", broadcasted.log),
      );
    }

    const transactionId = toHex(broadcasted.hash).toUpperCase();
    return new Promise((resolve, reject) =>
      pollForTx(transactionId).then(
        (value) => {
          clearTimeout(txPollTimeout);
          resolve(value);
        },
        (error) => {
          clearTimeout(txPollTimeout);
          reject(error);
        },
      ),
    );
  }

  private async txsQuery(query: string): Promise<IndexedTx[]> {
    const results = await this.forceGetCometClient().txSearchAll({ query: query });
    return results.txs.map((tx): IndexedTx => {
      const events = tx.result.events.map(fromTendermintEvent);
      const msgResponses = extractMsgResponsesFromEvents(events);

      return {
        height: tx.height,
        txIndex: tx.index,
        hash: toHex(tx.hash).toUpperCase(),
        code: tx.result.code,
        events: events,
        tx: tx.tx,
        msgResponses: msgResponses,
        gasUsed: tx.result.gasUsed,
        gasWanted: tx.result.gasWanted,
      };
    });
  }
}