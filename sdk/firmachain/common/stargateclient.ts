/* eslint-disable @typescript-eslint/naming-convention */
import { toHex } from "@cosmjs/encoding";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";
import { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";

export class TimeoutError extends Error {
    readonly txId: string;

    public constructor(message: string, txId: string) {
        super(message);
        this.txId = txId;
    }
}

/** A transaction that is indexed as part of the transaction history */
export interface IndexedTx {
    readonly height: number;
    readonly hash: string;

    readonly code: number;
    readonly rawLog: string;

    readonly tx: Uint8Array;
    readonly gasUsed: number;
    readonly gasWanted: number;
}

export interface BroadcastTxFailure {
    readonly height: number;
    readonly code: number;
    readonly transactionHash: string;
    readonly rawLog?: string;
    readonly data?: readonly MsgData[];
}

export interface BroadcastTxSuccess {
    readonly height: number;
    readonly code: number;
    readonly transactionHash: string;
    readonly rawLog?: string;
    readonly data?: readonly MsgData[];
    readonly gasUsed: number;
    readonly gasWanted: number;
}

export type BroadcastTxResponse = BroadcastTxSuccess | BroadcastTxFailure;

export function isBroadcastTxFailure(result: BroadcastTxResponse): boolean {
    return result.code != 0;
}

export function isBroadcastTxSuccess(result: BroadcastTxResponse): boolean {
    return result.code == 0;
}

export class StargateClient {
    private readonly tmClient: Tendermint34Client | undefined;

    static async connect(endpoint: string): Promise<StargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint);
        return new StargateClient(tmClient);
    }

    protected constructor(tmClient: Tendermint34Client | undefined) {
        if (tmClient) {
            this.tmClient = tmClient;
        }
    }

    protected getTmClient(): Tendermint34Client | undefined {
        return this.tmClient;
    }

    protected forceGetTmClient(): Tendermint34Client {
        if (!this.tmClient) {
            throw new Error(
                "Tendermint client not available. You cannot use online functionality in offline mode.",
            );
        }
        return this.tmClient;
    }

    async getTx(id: string): Promise<IndexedTx | null> {
        const results = await this.txsQuery(`tx.hash='${id}'`);
        return results[0] ?? null;
    }

    disconnect(): void {
        if (this.tmClient) this.tmClient.disconnect();
    }

    async broadcastTx(
        tx: Uint8Array,
        timeoutMs = 60_000,
        pollIntervalMs = 3_000,
    ): Promise<BroadcastTxResponse> {
        let timedOut = false;
        const txPollTimeout = setTimeout(() => {
            timedOut = true;
        },
            timeoutMs);

        const pollForTx = async (txId: string): Promise<BroadcastTxResponse> => {
            if (timedOut) {
                throw new TimeoutError(
                    `Transaction with ID ${txId
                    } was submitted but was not yet found on the chain. You might want to check later.`,
                    txId,
                );
            }
            await sleep(pollIntervalMs);
            const result = await this.getTx(txId);
            return result
                ? {
                    code: result.code,
                    height: result.height,
                    rawLog: result.rawLog,
                    transactionHash: txId,
                    gasUsed: result.gasUsed,
                    gasWanted: result.gasWanted,
                }
                : pollForTx(txId);
        };

        let test = await this.forceGetTmClient().status();

        const broadcasted = await this.forceGetTmClient().broadcastTxSync({ tx });
        if (broadcasted.code) {
            throw new Error(
                `Broadcasting transaction failed with code ${broadcasted.code} (codespace: ${broadcasted.codeSpace
                }). Log: ${broadcasted.log}`,
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

    private async txsQuery(query: string): Promise<readonly IndexedTx[]> {
        const results = await this.forceGetTmClient().txSearchAll({ query: query });
        return results.txs.map((tx) => {
            return {
                height: tx.height,
                hash: toHex(tx.hash).toUpperCase(),
                code: tx.result.code,
                rawLog: tx.result.log || "",
                tx: tx.tx,
                gasUsed: tx.result.gasUsed,
                gasWanted: tx.result.gasWanted,
            };
        });
    }
}