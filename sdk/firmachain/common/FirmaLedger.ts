import CosmosApp from '@zondax/ledger-cosmos-js';
import { Secp256k1Signature } from '@cosmjs/crypto';

import { LedgerWalletInterface } from './LedgerWallet';

const FIRMA_PATH = "m/44'/7777777'/0'/0/0";
const FIRMA_HRP = 'firma';

export type { LedgerWalletInterface };

// Minimal interface for Ledger transport classes (WebHID, NodeHID, etc.)
export interface LedgerTransportClass {
  create(): Promise<any>;
}

// ─── Web (WebHID) wallet ──────────────────────────────────────────────────────

export class FirmaCosmosLedgerWallet implements LedgerWalletInterface {
  private transportHID: LedgerTransportClass;
  private cosmosApp: CosmosApp | undefined;
  private isOpen = false;

  constructor(transportHID: LedgerTransportClass) {
    this.transportHID = transportHID;
  }

  private async connect() {
    if (this.isOpen) return;
    const transport = await this.transportHID.create();
    console.log('[Ledger] transport.deviceModel :', transport.deviceModel?.id);
    console.log('[Ledger] transport.deviceModel :', transport.deviceModel?.productName);
    this.cosmosApp = new CosmosApp(transport);
    console.log('[Ledger] cosmosApp:', this.cosmosApp);
    this.isOpen = true;
    console.log('[Ledger] connect success');
  }

  private async close() {
    try { (this.cosmosApp as any)?.transport?.close(); } catch (_) {}
    this.isOpen = false;
  }

  async getAddress(): Promise<string> {
    try {
      console.log('[FirmaLedger] getAddress');
      await this.connect();
      const response = await this.cosmosApp!.getAddressAndPubKey(FIRMA_PATH, FIRMA_HRP);
      await this.close();
      return response.bech32_address;
    } catch (error: any) {
      console.error('[FirmaLedger] getAddress error:', error?.message, '| returnCode: 0x' + error?.returnCode?.toString(16));
      await this.close();
      return '';
    }
  }

  async getAddressAndPublicKey(): Promise<{ address: string; publicKey: Uint8Array }> {
    try {
      await this.connect();
      const response = await this.cosmosApp!.getAddressAndPubKey(FIRMA_PATH, FIRMA_HRP);
      await this.close();
      return { address: response.bech32_address, publicKey: new Uint8Array(response.compressed_pk) };
    } catch (error: any) {
      console.error('[FirmaLedger] getAddressAndPublicKey error:', error?.message, '| returnCode: 0x' + error?.returnCode?.toString(16));
      await this.close();
      return { address: '', publicKey: new Uint8Array() };
    }
  }

  async getPublicKey(): Promise<Uint8Array> {
    try {
      console.log('[FirmaLedger] getPublicKey');
      await this.connect();
      console.log('[FirmaLedger] cosmosApp:', this.cosmosApp);
      console.log('[FirmaLedger] FIRMA_PATH:', FIRMA_PATH);
      console.log('[FirmaLedger] FIRMA_HRP:', FIRMA_HRP);
      const response = await this.cosmosApp!.getAddressAndPubKey(FIRMA_PATH, FIRMA_HRP);
      console.log('[FirmaLedger] response:', response);
      console.log('[FirmaLedger] response.compressed_pk:', response.compressed_pk);
      await this.close();
      return new Uint8Array(response.compressed_pk);
    } catch (error) {
      console.error('[FirmaLedger] getPublicKey error:', error);
      await this.close();
      throw error;
    }
  }

  async showAddressOnDevice(): Promise<void> {
    try {
      await this.connect();
      await this.cosmosApp!.showAddressAndPubKey(FIRMA_PATH, FIRMA_HRP);
      await this.close();
    } catch (error) {
      console.log(error);
      await this.close();
    }
  }

  async sign(message: string | Uint8Array, txtype = 0x00): Promise<Uint8Array> {
    try {
      const buffer = typeof message === 'string' ? Buffer.from(message) : Buffer.from(message);
      console.log('[FirmaLedger] sign txtype:', txtype, 'buffer length:', buffer.length);
      await this.connect();
      const response = await this.cosmosApp!.sign(FIRMA_PATH, buffer, FIRMA_HRP, txtype);
      await this.close();
      const secp256k1 = Secp256k1Signature.fromDer(response.signature).toFixedLength();
      return new Uint8Array(secp256k1);
    } catch (error) {
      console.error('[FirmaLedger] sign error:', error);
      await this.close();
      throw error;
    }
  }
}

// ─── Electron (Bridge) wallet ─────────────────────────────────────────────────

type GetAddressAndPublicKeyCallback = () => Promise<{ address: string; publicKey: Uint8Array }>;
type GetAddressCallback = () => Promise<string>;
type SignCallback = (message: string | Uint8Array, txtype?: number) => Promise<Uint8Array>;
type GetPublicKeyCallback = () => Promise<Uint8Array>;
type ShowAddressOnDeviceCallback = () => void;

export class FirmaBridgeLedgerWallet implements LedgerWalletInterface {
  private getAddressAndPublicKeyCallback: GetAddressAndPublicKeyCallback | undefined;
  private getAddressCallback: GetAddressCallback | undefined;
  private signCallback: SignCallback | undefined;
  private getPublicKeyCallback: GetPublicKeyCallback | undefined;
  private showAddressOnDeviceCallback: ShowAddressOnDeviceCallback | undefined;

  registerGetAddressAndPublicKeyCallback(cb: GetAddressAndPublicKeyCallback) { this.getAddressAndPublicKeyCallback = cb; }
  registerGetAddressCallback(cb: GetAddressCallback) { this.getAddressCallback = cb; }
  registerGetSignCallback(cb: SignCallback) { this.signCallback = cb; }
  registerGetPublicKeyCallback(cb: GetPublicKeyCallback) { this.getPublicKeyCallback = cb; }
  registerShowAddressOnDevice(cb: ShowAddressOnDeviceCallback) { this.showAddressOnDeviceCallback = cb; }

  async showAddressOnDevice(): Promise<void> { this.showAddressOnDeviceCallback!(); }
  async getPublicKey(): Promise<Uint8Array> { return this.getPublicKeyCallback!(); }
  async getAddressAndPublicKey() { return this.getAddressAndPublicKeyCallback!(); }
  async getAddress(): Promise<string> { return this.getAddressCallback!(); }
  async sign(message: string | Uint8Array, txtype?: number): Promise<Uint8Array> { return this.signCallback!(message, txtype); }
}
