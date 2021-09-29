import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { stringToPath, Slip10, HdPath, Slip10Curve, Bip39, EnglishMnemonic } from "@cosmjs/crypto";

import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";
const CryptoJS = require('crypto-js');

export class FirmaWalletService {
	private _mnemonic: string;
	private _privateKey: string;
	private _accountIndex: number;

	private _wallet!: DirectSecp256k1Wallet;

	getHdPath(): string {
		return this._config.hdPath;
	}

	getPrefix(): string {
		return this._config.prefix;
	}

	public getRawWallet(): DirectSecp256k1Wallet {
		return this._wallet;
	}

	public getPrivateKey(): string {
		return this._privateKey;
	}

	public getMnemonic(): string {
		return this._mnemonic;
	}

	public async getAddress(): Promise<string> {

		try {
			let accounts = await this._wallet.getAccounts();
			return accounts[0].address;
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	constructor(private _config: FirmaConfig) {
		this._mnemonic = "";
		this._privateKey = "";
		this._accountIndex = 0;
	}

	private static getHdPath(hdPath: string, accountIndex: number): HdPath[] {
		try {
			return [stringToPath(hdPath + accountIndex + "'/0/0")];
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async initFromMnemonic(mnemonic: string, accountIndex: number = 0) {

		try {
			this._mnemonic = mnemonic;
			this._accountIndex = accountIndex;

			let privateKey = await this.getPrivateKeyInternal(this._mnemonic, this._accountIndex);
			await this.initFromPrivateKey(privateKey);

			return { success: true };

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	private async getPrivateKeyInternal(mnemonic: string, accountIndex: number): Promise<string> {

		try {
			const mnemonicChecked = new EnglishMnemonic(mnemonic);
			const seed = await Bip39.mnemonicToSeed(mnemonicChecked);

			let hdpath = FirmaWalletService.getHdPath(this.getHdPath(), this._accountIndex)

			const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, hdpath[0]);

			let privateKey = "0x" + Buffer.from(privkey).toString('hex');
			return privateKey;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async initFromPrivateKey(privateKey: string) {
		try {
			let tempPrivateKey = Buffer.from(privateKey.replace('0x', ''), 'hex');
			this._wallet = await DirectSecp256k1Wallet.fromKey(tempPrivateKey, this.getPrefix());
			this._privateKey = privateKey;
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public decryptData(data: string): string {
		try {
			var bytes = CryptoJS.AES.decrypt(data, this.getPrivateKey());
			return bytes.toString(CryptoJS.enc.Utf8);
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public encryptData(data: string): string {
		try {
			return CryptoJS.AES.encrypt(data, this.getPrivateKey()).toString();
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async newWallet(): Promise<FirmaWalletService> {
		try {
			let mnemonic = await this.generateMnemonic();
			let wallet = await this.fromMnemonic(mnemonic);

			return wallet;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async fromMnemonic(mnemonic: string, accountIndex: number = 0): Promise<FirmaWalletService> {
		try {
			let wallet = new FirmaWalletService(this._config);
			await wallet.initFromMnemonic(mnemonic, accountIndex);

			return wallet;

		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async fromPrivateKey(privateKey: string): Promise<FirmaWalletService> {
		try {
			let wallet = new FirmaWalletService(this._config);
			await wallet.initFromPrivateKey(privateKey);

			return wallet;
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}

	public async generateMnemonic(): Promise<string> {
		try {
			let wallet = await DirectSecp256k1HdWallet.generate(24);
			return wallet.mnemonic;
		} catch (error) {
			FirmaUtil.printLog(error);
			throw error;
		}
	}
}