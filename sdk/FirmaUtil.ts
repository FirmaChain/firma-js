import { promises as fs } from "fs";
import { SignDoc, TxRaw, AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import axios from "axios";

import { Duration } from "cosmjs-types/google/protobuf/duration";
import { fromBech32, toBech32, fromHex, toBase64, toHex, fromBase64 } from '@cosmjs/encoding';
import { EncodeObject, makeSignBytes, makeSignDoc, Registry } from "@cosmjs/proto-signing";

import { SignAndBroadcastOptions, TxMisc, ArbitraryVerifyData } from "./firmachain/common";

import {
    ExtendedSecp256k1Signature,
    Secp256k1,
    sha256 as sha256crypto,
    Secp256k1Signature,
} from '@cosmjs/crypto';

import { pubkeyToAddress } from '@cosmjs/amino';


import { FirmaConfig } from "./FirmaConfig";
import { FirmaWalletService } from "./FirmaWalletService";
import { Any } from "./firmachain/google/protobuf/any";
import { CommonTxClient } from "./firmachain/common/CommonTxClient";
import { TendermintQueryClient } from "./firmachain/common/TendermintQueryClient";
import { BigNumber } from "bignumber.js";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/tendermint-rpc";
import { arrayContentEquals } from "@cosmjs/utils";

const CryptoJS = require("crypto-js");
const sha1 = require("crypto-js/sha1");
const sha256 = require("crypto-js/sha256");
const encHex = require("crypto-js/enc-hex");

export class FirmaUtil {
	static config: FirmaConfig;

    static readonly FctDecimal: number = 6;

    constructor(firmaConfig: FirmaConfig) {
        FirmaUtil.config = firmaConfig;
    }

    static getSignAndBroadcastOption(denom: string, txMisc: TxMisc): SignAndBroadcastOptions {

        if (txMisc.memo == null)
            txMisc.memo = "";

        // INFO: if fee or gas data is not set default, those value will be null. So we have to double check it.

        if (txMisc.fee == 0 || txMisc.fee == null)
            txMisc.fee = FirmaUtil.config.defaultFee;
        if (txMisc.gas == 0 || txMisc.gas == null)
            txMisc.gas = FirmaUtil.config.defaultGas;
        if (txMisc.feeGranter == null)
            txMisc.feeGranter = "";

        const gasFeeAmount = { denom: denom, amount: txMisc.fee!.toString() };
        const defaultFee = { amount: [gasFeeAmount], gas: txMisc.gas!.toString(), granter: txMisc.feeGranter! };

        return { fee: defaultFee, memo: txMisc.memo! };
    }

    static getUTokenStringFromTokenStr(tokenAmount: string, decimal: number): string {
        const fct = Number.parseFloat(tokenAmount);
        const decimalMutiplyer = Math.pow(10, decimal);
        const big = fct * decimalMutiplyer;

        return big.toFixed(0);
    }

    static getTokenStringFromUTokenStr(uTokenAmount: string, decimal: number): string {
        const ufct = Number.parseInt(uTokenAmount);
        const decimalMutiplyer = Math.pow(10, decimal);

        return (ufct / decimalMutiplyer).toString();
    }

    static getUTokenStringFromToken(tokenAmount: number, decimal: number): string {
        const decimalMutiplyer = Math.pow(10, decimal);
        const big = tokenAmount * decimalMutiplyer;

        return big.toFixed(0);
    }

    static getUTokenFromToken(tokenAmount: number, decimal: number): number {
        const decimalMutiplyer = Math.pow(10, decimal);
        const big = tokenAmount * decimalMutiplyer;
        const newBig = big.toFixed(0);

        return Number.parseInt(newBig);
    }

    static arrayBufferToBase64(buffer: Uint8Array): string {
        return Buffer.from(buffer).toString("base64");

        /*var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);*/
        
    }

    static base64ToArrayBuffer(base64: string): Uint8Array {

        const buffer = Buffer.from(base64, "base64");
        return new Uint8Array(buffer);

/*        var binary_string = atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;*/
    }

    static getTokenStringFromUToken(uTokenAmount: number, decimal: number): string {

        const fixedUTokenAmount = Math.floor(uTokenAmount);

        const decimalMutiplyer = Math.pow(10, decimal);
        return (fixedUTokenAmount / decimalMutiplyer).toString();
    }

    static getUFCTStringFromFCTStr(fctAmount: string): string {
        return this.getUTokenStringFromTokenStr(fctAmount, this.FctDecimal);
    }

    static getUFCTFromFCT(fctAmount: number): number {
        return this.getUTokenFromToken(fctAmount, this.FctDecimal);
    }

    static getFCTStringFromUFCTStr(uFctAmount: string): string {
        return this.getTokenStringFromUTokenStr(uFctAmount, this.FctDecimal);
    }

    static getUFCTStringFromFCT(fctAmount: number): string {
        return this.getUTokenStringFromToken(fctAmount, this.FctDecimal);
    }

    static getFCTStringFromUFCT(uFctAmount: number): string {
        return this.getTokenStringFromUToken(uFctAmount, this.FctDecimal);
    }

    static async getFileHash(filePath: string): Promise<string> {
        const fileData = await fs.readFile(filePath);
        const data = CryptoJS.lib.WordArray.create(fileData.buffer);

        return sha256(data).toString(encHex);
    }

    static getFileHashFromBuffer(buffer: Uint8Array): string {
        const data = CryptoJS.lib.WordArray.create(buffer);
        return sha256(data).toString(encHex);
    }

    static getSha1HashFromString(text: string): string {
        const data = CryptoJS.lib.WordArray.create(text);
        return sha1(data).toString(encHex);
    }

    static getHashFromString(text: string): string {
        const data = CryptoJS.lib.WordArray.create(text);
        return sha256(data).toString(encHex);
    }

    static isValidAddress(address: string): boolean {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            fromBech32(address).data;
            return true;
        }
        catch (e) {

        }

        return false;
    }

    static buf2hex(buffer: Uint8Array) { // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }

    // for evm address support
    static getHexAddressFromAddress(address: string): string {
        const data = fromBech32(address).data;
        return "0x" + FirmaUtil.buf2hex(data);
    }

    static getValOperAddressFromAccAddress(address: string): string {
        const data = fromBech32(address).data;
        return toBech32(FirmaUtil.config.prefix + "valoper", data);
    }

    static getValConsAddressFromAccAddress(consensusPubkey: string): string {

        const ed25519PubkeyRaw = fromBase64(consensusPubkey);
        const addressData = sha256crypto(ed25519PubkeyRaw).slice(0, 20);
        return toBech32(FirmaUtil.config.prefix + "valcons", addressData);
    }

    static getAccAddressFromValOperAddress(address: string): string {
        const data = fromBech32(address).data;
        return toBech32(FirmaUtil.config.prefix, data);
    }

    static async estimateGas(txRaw: TxRaw): Promise<number> {

        try {
            const encodedTx = Uint8Array.from(TxRaw.encode(txRaw).finish());
            const hexTx = `0x${Buffer.from(encodedTx).toString("hex")}`;

            const queryClient = new TendermintQueryClient(FirmaUtil.config.rpcAddress);
            const gas = await queryClient.queryEstimateGas(hexTx);

            const multiplier = 1.15;

            return Math.ceil(gas * multiplier);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    static async estimateGasRaw(txRaw: Uint8Array): Promise<number> {

        try {
            const encodedTx = Uint8Array.from(txRaw);
            const hexTx = `0x${Buffer.from(encodedTx).toString("hex")}`;

            const queryClient = new TendermintQueryClient(FirmaUtil.config.rpcAddress);
            const gas = await queryClient.queryEstimateGas(hexTx);

            const multiplier = 1.25;

            return Math.ceil(gas * multiplier);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    static async getAccountInfo(address: string): Promise<{ account_number: string; sequence: string }> {
        try {
            const res = await axios.get(`${FirmaUtil.config.restApiAddress}/cosmos/auth/v1beta1/accounts/${address}`);
            if (res.status !== 200) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const json = res.data;
            const baseAccount = json.account.base_account || json.account;
            const result = {
                account_number: baseAccount.account_number,
                sequence: baseAccount.sequence,
            };
            
            return result;
            
        } catch (error) {
            throw error;
        }
    }

    static async getChainId(): Promise<string> {
        const res = await axios.get(`${FirmaUtil.config.restApiAddress}/cosmos/base/tendermint/v1beta1/node_info`);
        const json = res.data;
        return json.default_node_info.network;
    }

    static printLog(log: any) {
        if (FirmaUtil.config.isShowLog === false)
            return;

        console.log(`[FirmaSDK] ${log}`);
    }

    private static async recoverSigningAddress(
        signature: string,
        hash: Uint8Array,
        recoveryIndex: number
    ): Promise<string | null> {
        if (recoveryIndex > 3) {
            throw new Error('Invalid recovery index');
        }

        const sig = Secp256k1Signature.fromFixedLength(fromBase64(signature));
        const extendedSig = new ExtendedSecp256k1Signature(
            sig.r(),
            sig.s(),
            recoveryIndex
        );
        try {
            const recoveredPubKey = await Secp256k1.recoverPubkey(extendedSig, hash);
            return pubkeyToAddress(
                {
                    type: 'tendermint/PubKeySecp256k1',
                    value: toBase64(Secp256k1.compressPubkey(recoveredPubKey)),
                },
                'firma'
            );
        } catch {
            return null;
        }
    }

    private static async verifySignature(
        address: string,
        signature: string,
        hash: Uint8Array
    ): Promise<boolean> {
        for (let i = 0; i < 4; i++) {
            const recoveredAddress = await this.recoverSigningAddress(signature, hash, i);

            if (recoveredAddress === address) {
                return true;
            }
        }

        return false;
    }

    public static verifyDirectSignature(
        address: string,
        signature: string,
        signDoc: SignDoc
    ) {
        const messageHash = sha256crypto(makeSignBytes(signDoc));

        return this.verifySignature(address, signature, messageHash);
    };

    public static parseSignDocValues(signDocString: string) : any{

        const signDoc = JSON.parse(signDocString);

        return {
            ...signDoc,
            bodyBytes: fromHex(signDoc.bodyBytes),
            authInfoBytes: fromHex(signDoc.authInfoBytes),
            accountNumber: BigInt(signDoc.accountNumber),
          };
    }

    public static stringifySignDocValues(signDoc: any): string {

        return JSON.stringify({
            ...signDoc,
            bodyBytes: toHex(signDoc.bodyBytes),
            authInfoBytes: toHex(signDoc.authInfoBytes),
            accountNumber: signDoc.accountNumber.toString(),
          });
    }

    public static getAnyData(registry: Registry, message: EncodeObject): Any {
        const anyData = Any.fromPartial({
            typeUrl: message.typeUrl,
            value: registry.encode(message)
        });

        return anyData;
    }

    static getCommonTxClient(aliceWallet: FirmaWalletService) {
        return new CommonTxClient(aliceWallet, FirmaUtil.config.rpcAddress);
	}

    static parseDurationString(durationStr: string): { seconds: bigint; nanos: number } {
        if (!durationStr || durationStr.trim() === "") {
            return { seconds: BigInt(0), nanos: 0 };
        }
    
        const input = durationStr.trim();
        let totalSeconds = 0;
        let totalNanos = 0;
    
        // Handle negative durations
        const isNegative = input.startsWith('-');
        const cleanInput = isNegative ? input.substring(1) : input;
    
        // Regular expression to match duration components
        const regex = /(\d+(?:\.\d+)?)(d|h|m|s|ms|µs|us|ns)/g;
        let match;
        let hasMatches = false;

        while ((match = regex.exec(cleanInput)) !== null) {
            hasMatches = true;
            const value = parseFloat(match[1]);
            const unit = match[2];

            switch (unit) {
                case 'd':  // days
                    totalSeconds += value * 24 * 60 * 60;
                    break;
                case 'h':  // hours
                    totalSeconds += value * 60 * 60;
                    break;
                case 'm':  // minutes
                    totalSeconds += value * 60;
                    break;
                case 's':  // seconds
                    totalSeconds += value;
                    break;
                case 'ms': // milliseconds
                    totalNanos += value * 1_000_000;
                    break;
                case 'µs':
                case 'us': // microseconds
                    totalNanos += value * 1_000;
                    break;
                case 'ns': // nanoseconds
                    totalNanos += value;
                    break;
            }
        }

        if (!hasMatches) {
            throw new Error(`Invalid duration format: ${durationStr}`);
        }

        // Convert excess nanos to seconds
        const extraSeconds = Math.floor(totalNanos / 1_000_000_000);
        totalSeconds += extraSeconds;
        totalNanos = totalNanos % 1_000_000_000;

        // Apply negative sign
        const finalSeconds = isNegative ? -totalSeconds : totalSeconds;
        const finalNanos = isNegative ? -totalNanos : totalNanos;
    
        return {
            seconds: BigInt(Math.floor(finalSeconds)),
            nanos: Math.floor(finalNanos)
        };
    }

    static createDurationFromString(durationStr: string): Duration {
        const { seconds, nanos } = FirmaUtil.parseDurationString(durationStr);
        
        // Import Duration if not already imported
        const { Duration } = require("./firmachain/google/protobuf/duration");
        
        return Duration.fromPartial({
            seconds: seconds,
            nanos: nanos
        });
    }

    /**
     * Safely processes commission rate strings to prevent big.Int conversion errors.
     * Converts decimal commission rates to Cosmos SDK atomics format (integer representation).
     * 
     * @param commissionRate - Commission rate string from staking params
     * @returns Processed commission rate string safe for protobuf usage (atomics format or empty string)
     */
    static processCommissionRateAsDecimal(commissionRate: string): string {
        const trimmed = commissionRate.trim();

        if (!commissionRate || trimmed === "") {
            throw new Error(`Invalid commission rate format: ${commissionRate}`);
        }
        
        if (!/^-?\d+\.?\d*$/.test(trimmed)) {
            throw new Error(`Invalid commission rate format: ${commissionRate}`);
        }
        
        // Validates input and creates BigNumber instance
        const commissionRateBN = new BigNumber(trimmed);

        // Checks if it's a valid finite number
        if (!commissionRateBN.isFinite()) throw new Error("Invalid commission rate format: " + commissionRate);

        // Validates range (0 to 1 inclusive)
        if (commissionRateBN.isNegative() || commissionRateBN.isGreaterThan(1)) throw new Error("Invalid commission rate range. Must be between 0 and 1 inclusive.");

        // Converts to atomics format (multiply by 10^18)
        const atomics = commissionRateBN.multipliedBy(new BigNumber(10).pow(18));

        // Returns integer string
        return atomics.integerValue(BigNumber.ROUND_DOWN).toString();
    }

    /**
     * ADR-036 protobuf arbitrary signing
     * 
     * @param wallet - FirmaWalletService instance
     * @param signerAddress - Address of the signer
     * @param data - Arbitrary data to sign
     * @returns ArbitraryVerifyData for verification
     */
    static async protobufArbitrarySign(wallet: FirmaWalletService, signerAddress: string, data: Uint8Array): Promise<ArbitraryVerifyData> {
        try {
            const rawWallet = wallet.getRawWallet();
            const accounts = await rawWallet.getAccounts();
            const account = accounts.find(acc => acc.address === signerAddress);
            if (!account) {
                throw new Error("Account not found in rawWallet");
            }

            // ADR-036 compatible: Create empty transaction with arbitrary data as memo
            // This is more compatible with standard ADR-036 approach
            const txBody = TxBody.fromPartial({
                messages: [], // Empty messages for arbitrary signing
                memo: new TextDecoder().decode(data), // Store arbitrary data in memo field
                timeoutHeight: BigInt(0),
            });

            // Create minimal AuthInfo for ADR-036
            const authInfo = AuthInfo.fromPartial({
                signerInfos: [],
                fee: {
                    amount: [],
                    gasLimit: BigInt(0),
                    payer: "",
                    granter: ""
                }
            });

            // Create SignDoc following ADR-036 pattern
            const signDoc = makeSignDoc(
                TxBody.encode(txBody).finish(),
                AuthInfo.encode(authInfo).finish(),
                "", // Empty chainId for arbitrary signing
                0   // 0 account number for arbitrary signing
            );

            // Sign the document
            const signBytes = makeSignBytes(signDoc);
            const hash = sha256crypto(signBytes);

            const privKey = (rawWallet as any)["privkey"];
            if (!privKey) {
                throw new Error("Private key not accessible from wallet");
            }

            const signature = await Secp256k1.createSignature(hash, privKey);
            const sigBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);

            return {
                chainId: signDoc.chainId,
                accountNumber: signDoc.accountNumber.toString(),
                sequence: "0",
                bodyBytes: toBase64(signDoc.bodyBytes),
                authInfoBytes: toBase64(signDoc.authInfoBytes),
                signerAddress: signerAddress,
                pubkey: toBase64(account.pubkey),
                signature: toBase64(sigBytes),
            };
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    /**
     * ADR-036 protobuf arbitrary signature verification
     * 
     * @param data - ArbitraryVerifyData to verify
     * @param originalMessage - Original message that was signed
     * @returns boolean indicating if the signature is valid
     */
    static async protobufArbitraryVerify(data: ArbitraryVerifyData, originalMessage: Uint8Array): Promise<boolean> {
        try {
            // Reconstruct SignDoc
            const signDoc = makeSignDoc(
                fromBase64(data.bodyBytes),
                fromBase64(data.authInfoBytes),
                data.chainId,
                Number(data.accountNumber)
            );

            // Verify the message content - ADR-036 style with memo
            const txBody = TxBody.decode(signDoc.bodyBytes);
            
            // For ADR-036 arbitrary signing, messages should be empty
            if (txBody.messages.length !== 0) {
                return false;
            }

            // Extract data from memo field
            const memoData = txBody.memo;
            const originalMessageString = new TextDecoder().decode(originalMessage);
            
            if (memoData !== originalMessageString) {
                return false;
            }

            // Verify signature
            const signBytes = makeSignBytes(signDoc);
            const hash = sha256crypto(signBytes);

            try {
                const pubkeyBytes = fromBase64(data.pubkey);
                const signatureBytes = fromBase64(data.signature);
                
                const secpSig = Secp256k1Signature.fromFixedLength(signatureBytes);

                // Verify address matches pubkey
                const rawSignerAddr = rawSecp256k1PubkeyToRawAddress(pubkeyBytes);
                const bech32SignerAddr = fromBech32(data.signerAddress).data;
                
                if (!rawSignerAddr || !bech32SignerAddr || !arrayContentEquals(rawSignerAddr, bech32SignerAddr)) {
                    return false;
                }

                const isValid = await Secp256k1.verifySignature(secpSig, hash, pubkeyBytes);
                
                return isValid;
            } catch (error: any) {
                return false;
            }

        } catch (error) {
            return false;
        }
    }
}

export const DefaultTxMisc = { memo: "", fee: 0, gas: 0, feeGranter: "" };
export const getSignAndBroadcastOption = FirmaUtil.getSignAndBroadcastOption;