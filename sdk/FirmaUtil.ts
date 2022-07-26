import { promises as fs } from "fs";
import { SignDoc, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { TendermintQueryClient } from "./firmachain/common/TendermintQueryClient";
import { FirmaConfig } from "./FirmaConfig";

import { Bech32 } from "@cosmjs/encoding";
import { LedgerSigningStargateClient, SignerData } from "./firmachain/common/LedgerSigningStargateClient";
import { SignAndBroadcastOptions, TxMisc } from "./firmachain/common";
import { fromHex, toBase64, toHex, fromBase64 } from '@cosmjs/encoding';

import {
    ExtendedSecp256k1Signature,
    Secp256k1,
    sha256 as sha256crypto,
    Secp256k1Signature,
} from '@cosmjs/crypto';

import { decodeSignature, pubkeyToAddress } from '@cosmjs/amino';

import { ArbitraryVerifyData, SigningAminoStargateClient } from "./firmachain/common/signingaminostargateclient";
import { EncodeObject, makeSignBytes, Registry } from "@cosmjs/proto-signing";
import { FirmaWalletService } from "./FirmaWalletService";
import { SigningStargateClient } from "./firmachain/common/signingstargateclient";
import { Any } from "./firmachain/google/protobuf/any";
import Long from "long";
import { CommonTxClient } from "./firmachain/common/CommonTxClient";

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
            Bech32.decode(address).data;
            return true;
        }
        catch (e) {

        }

        return false;
    }

    static getValOperAddressFromAccAddress(address: string): string {
        const data = Bech32.decode(address).data;
        return Bech32.encode(FirmaUtil.config.prefix + "valoper", data);
    }

    static getAccAddressFromValOperAddress(address: string): string {
        const data = Bech32.decode(address).data;
        return Bech32.encode(FirmaUtil.config.prefix, data);
    }

    static async getSignerDataForLedger(address: string): Promise<SignerData> {

        try {

            let signingClient = await LedgerSigningStargateClient.connectWithSigner(FirmaUtil.config.rpcAddress);
            let sequence = await signingClient.getSignerData(address);

            return sequence;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
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

            console.log("hexTx:" + hexTx);

            const queryClient = new TendermintQueryClient(FirmaUtil.config.rpcAddress);
            const gas = await queryClient.queryEstimateGas(hexTx);

            const multiplier = 1.25;

            return Math.ceil(gas * multiplier);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    static printLog(log: any) {
        if (FirmaUtil.config.isShowLog === false)
            return;

        console.log(`[FirmaSDK] ${log}`);
    }

    static async experimentalAdr36Sign(wallet: FirmaWalletService, data: string): Promise<ArbitraryVerifyData> {

        try {
            const registry = new Registry();
            const aliceClient = await SigningAminoStargateClient.connectWithSigner(FirmaUtil.config.rpcAddress, wallet.getRawAminoWallet(), registry);

            const address = await wallet.getAddress();

            let userData: Uint8Array | Uint8Array[] = Buffer.from(data);

            return await aliceClient.experimentalAdr36Sign(address, userData);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    static async experimentalAdr36Verify(data: ArbitraryVerifyData, checkMsg: string): Promise<boolean> {
        try {
            return await SigningAminoStargateClient.experimentalAdr36Verify(data, checkMsg);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
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
            accountNumber: new Long(signDoc.accountNumber),
          };
    }

    public static stringifySignDocValues(signDoc: any): string {
        return JSON.stringify({
            ...signDoc,
            bodyBytes: toHex(signDoc.bodyBytes),
            authInfoBytes: toHex(signDoc.authInfoBytes),
            accountNumber: signDoc.accountNumber.toString(16),
          });
    }

    public static async makeSignDoc(
        signerAddress: string,
        pubkey: string,
        messages: readonly EncodeObject[],        
        txMisc: TxMisc = DefaultTxMisc
    ): Promise<SignDoc> {

        let result = FirmaUtil.getSignAndBroadcastOption(FirmaUtil.config.denom, txMisc);

        let chainID = FirmaUtil.config.chainID;
        let serverUrl = FirmaUtil.config.rpcAddress;
        let registry = CommonTxClient.getRegistry();

        return await SigningStargateClient.makeSignDocForSend(signerAddress, pubkey, messages, result.fee, result.memo, serverUrl, chainID, registry);
    }

    public static async makeSignDocWithStringify(signerAddress: string,
        pubkey: string,
        messages: readonly EncodeObject[],        
        txMisc: TxMisc = DefaultTxMisc
    ): Promise<string> {

        let signDoc = await this.makeSignDoc(signerAddress, pubkey, messages, txMisc);
        let stringSignDoc = this.stringifySignDocValues(signDoc);

        return stringSignDoc;
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
}

export const DefaultTxMisc = { memo: "", fee: 0, gas: 0, feeGranter: "" };
export const getSignAndBroadcastOption = FirmaUtil.getSignAndBroadcastOption;