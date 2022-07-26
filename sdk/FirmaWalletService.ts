import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";

import { stringToPath, Slip10, HdPath, Slip10Curve, Bip39, EnglishMnemonic } from "@cosmjs/crypto";
import { EncodeObject } from "@cosmjs/proto-signing";

import { FirmaConfig } from "./FirmaConfig";
import { FirmaUtil } from "./FirmaUtil";

import { SignAndBroadcastOptions } from "./firmachain/common";
import { LedgerWalletInterface, signFromLedger } from "./firmachain/common/LedgerWallet";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Secp256k1Wallet } from "@cosmjs/amino";

const CryptoJS = require("crypto-js");

export class FirmaWalletService {

    private mnemonic: string;
    private privateKey: string;
    private accountIndex: number;

    private aminoWallet!: Secp256k1Wallet;
    private wallet!: DirectSecp256k1Wallet;
    private ledger!: LedgerWalletInterface;

    getHdPath(): string {
        return this.config.hdPath;
    }

    getPrefix(): string {
        return this.config.prefix;
    }

    getRawWallet(): DirectSecp256k1Wallet {
        return this.wallet;
    }

    getRawAminoWallet(): Secp256k1Wallet {
        return this.aminoWallet;
    }

    getPrivateKey(): string {
        return this.privateKey;
    }

    getMnemonic(): string {
        return this.mnemonic;
    }

    isLedger(): boolean {
        return (this.ledger != null);
    }

    public async initFromLedger(ledger: LedgerWalletInterface): Promise<FirmaWalletService> {
        try {
            const wallet = new FirmaWalletService(this.config);
            wallet.ledger = ledger;

            return wallet;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async signLedger(messages: EncodeObject[], option: SignAndBroadcastOptions, registry: Registry): Promise<TxRaw> {
        return await signFromLedger(this.ledger, messages, option, registry)
    }

    async getPubKey(): Promise<string> {

        try {
            if (this.ledger != null) {
                return FirmaUtil.arrayBufferToBase64(await this.ledger.getPublicKey());
            }

            const accounts = await this.wallet.getAccounts();
            return FirmaUtil.arrayBufferToBase64(accounts[0].pubkey);

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAddress(): Promise<string> {

        try {

            if (this.ledger != null) {
                return await this.ledger.getAddress();
            }

            const accounts = await this.wallet.getAccounts();
            return accounts[0].address;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    constructor(private readonly config: FirmaConfig) {
        this.mnemonic = "";
        this.privateKey = "";
        this.accountIndex = 0;
    }

    private static getHdPath(hdPath: string, accountIndex: number): HdPath[] {
        try {
            return [stringToPath(hdPath + accountIndex + "'/0/0")];
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async initFromMnemonic(mnemonic: string, accountIndex: number = 0) {

        try {
            this.mnemonic = mnemonic;
            this.accountIndex = accountIndex;

            const privateKey = await this.getPrivateKeyInternal(this.mnemonic, this.accountIndex);
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

            const hdpath = FirmaWalletService.getHdPath(this.getHdPath(), accountIndex);

            const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, hdpath[0]);

            const privateKey = `0x${Buffer.from(privkey).toString("hex")}`;
            return privateKey;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async initFromPrivateKey(privateKey: string) {
        try {
            const tempPrivateKey = Buffer.from(privateKey.replace("0x", ""), "hex");
            this.wallet = await DirectSecp256k1Wallet.fromKey(tempPrivateKey, this.getPrefix());
            this.aminoWallet = await Secp256k1Wallet.fromKey(tempPrivateKey, this.getPrefix());
            
            this.privateKey = privateKey;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    decryptData(data: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(data, this.getPrivateKey());
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    encryptData(data: string): string {
        try {
            return CryptoJS.AES.encrypt(data, this.getPrivateKey()).toString();
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async newWallet(): Promise<FirmaWalletService> {
        try {
            const mnemonic = await this.generateMnemonic();
            const wallet = await this.fromMnemonic(mnemonic);

            return wallet;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async fromMnemonic(mnemonic: string, accountIndex: number = 0): Promise<FirmaWalletService> {
        try {
            const wallet = new FirmaWalletService(this.config);
            await wallet.initFromMnemonic(mnemonic, accountIndex);

            return wallet;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async fromPrivateKey(privateKey: string): Promise<FirmaWalletService> {
        try {
            const wallet = new FirmaWalletService(this.config);
            await wallet.initFromPrivateKey(privateKey);

            return wallet;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async generateMnemonic(): Promise<string> {
        try {
            const wallet = await DirectSecp256k1HdWallet.generate(24);
            return wallet.mnemonic;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}