import { promises as fs } from "fs";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { TendermintQueryClient } from "./firmachain/common/TendermintQueryClient";
import { FirmaConfig } from "./FirmaConfig";

const CryptoJS = require("crypto-js");
const sha256 = require("crypto-js/sha256");
const encHex = require("crypto-js/enc-hex");

import { Bech32 } from "@cosmjs/encoding";

export class FirmaUtil {

    static config: FirmaConfig;

    constructor(firmaConfig: FirmaConfig) {
        FirmaUtil.config = firmaConfig;
    }

    static getUFCTStringFromFCTStr(fctAmount: string): string {
        const fct = Number.parseFloat(fctAmount);
        const big = fct * 1000000;

        return big.toString();
    }

    static getFCTStringFromUFCTStr(uFctAmount: string): string {
        const ufct = Number.parseInt(uFctAmount);
        return (ufct / 1000000).toString();
    }

    static getUFCTStringFromFCT(fctAmount: number): string {
        const big = fctAmount * 1000000;

        return big.toString();
    }

    static getFCTStringFromUFCT(uFctAmount: number): string {
        const number = uFctAmount;
        return (number / 1000000).toString();
    }

    static async getFileHash(filePath: string): Promise<string> {
        const fileData = await fs.readFile(filePath);
        const data = CryptoJS.lib.WordArray.create(fileData.buffer);

        return sha256(data).toString(encHex);
    }

    static getValOperAddressFromAccAddress(address: string): string {
        const data = Bech32.decode(address).data;
        return Bech32.encode(FirmaUtil.config.prefix + "valoper", data);
    }

    static getAccAddressFromValOperAddress(address: string): string {
        const data = Bech32.decode(address).data;
        return Bech32.encode(FirmaUtil.config.prefix, data);
    }

    static async estimateGas(txRaw: TxRaw): Promise<number> {

        try {
            const encodedTx = Uint8Array.from(TxRaw.encode(txRaw).finish());
            const hexTx = `0x${Buffer.from(encodedTx).toString("hex")}`;

            const queryClient = new TendermintQueryClient(FirmaUtil.config.rpcAddress);
            const gas = await queryClient.queryEstimateGas(hexTx);

            const multiplier = 1.25;

            const targetGas = Math.ceil(gas * multiplier);
            return Math.ceil(targetGas * 0.01); // 3.2 -> 4

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
}