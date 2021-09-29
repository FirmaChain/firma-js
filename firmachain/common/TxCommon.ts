import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export interface StdFee {
	amount: Coin[];
	gas: string;
	granter: string;
}

export interface BasicFeeGrantOption {
	spendLimit?: number,
	expiration?: Date,
}

export interface PeriodicFeeGrantOption {
	basicSpendLimit?: number,
	basicExpiration?: Date,
	periodSeconds: number,
	periodSpendLimit: number,
	periodCanSpend: number,
	periodReset: Date
}

export const DefaultBasicFeeGrantOption = { spendLimit: undefined, expiration: undefined };

export interface TxMisc {
	memo?: string,
	fee?: number,
	gas?: number,
	feeGranter?: string
}

export function getSignAndBroadcastOption(denom: string, txMisc: TxMisc = DefaultTxMisc): SignAndBroadcastOptions {

	if (txMisc.memo == null)
		txMisc.memo = "";
	if (txMisc.fee == null)
		txMisc.fee = 2000;
	if (txMisc.gas == null)
		txMisc.gas = 200000;
	if (txMisc.feeGranter == null)
		txMisc.feeGranter = "";

	const gasFeeAmount = { denom: denom, amount: txMisc.fee!.toString() };
	const defaultFee = { amount: [gasFeeAmount], gas: txMisc.gas!.toString(), granter: txMisc.feeGranter! };

	return { fee: defaultFee, memo: txMisc.memo! };
}

export const DefaultTxMisc = { memo: "", fee: 2000, gas: 200000, feeGranter: "" };

export interface SignAndBroadcastOptions {
	fee: StdFee,
	memo: string
}