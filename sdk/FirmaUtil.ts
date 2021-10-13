import { promises as fs } from "fs";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TendermintQueryClient } from './firmachain/common/TendermintQueryClient';
import { FirmaConfig } from "./FirmaConfig";

const CryptoJS = require('crypto-js');
const sha256 = require('crypto-js/sha256');
const encHex = require('crypto-js/enc-hex');

import { Bech32 } from "@cosmjs/encoding";

export class FirmaUtil {

	public static Config: FirmaConfig;

	public static getUFCTStringFromFCT(fctAmount: number): string {
		return fctAmount + "000000";
	}

	public static async getFileHash(filePath: string): Promise<string> {
		var fileData = await fs.readFile(filePath);
		let data = CryptoJS.lib.WordArray.create(fileData.buffer);

		return sha256(data).toString(encHex);
	}

	public static getValOperAddressFromAccAddress(address: string): string {
		let data = Bech32.decode(address).data;
		return Bech32.encode(FirmaUtil.Config.prefix + "valoper", data);
	}

	public static getAccAddressFromValOperAddress(address: string): string {
		let data = Bech32.decode(address).data;
		return Bech32.encode(FirmaUtil.Config.prefix, data);
	}

	public static async estimateGas(txRaw: TxRaw): Promise<number> {

		try {
			const encodedTx = Uint8Array.from(TxRaw.encode(txRaw).finish());
			var hexTx = "0x" + Buffer.from(encodedTx).toString('hex');

			let queryClient = new TendermintQueryClient(FirmaUtil.Config.rpcAddress);
			return await queryClient.queryEstimateGas(hexTx);

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public static printLog(log: any) {
		if (FirmaUtil.Config.isShowLog == false)
			return;

		console.log("[FirmaSDK] " + log);
	}
}