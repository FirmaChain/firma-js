import { Registry } from "@cosmjs/proto-signing";

import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { StdFee } from ".";
import { Account, accountFromAny } from "./accounts";

import { StargateClient } from "./stargateclient";
import Axios from "axios";
import { Any } from "../google/protobuf/any";
import { Bech32, toBase64 } from "@cosmjs/encoding";
import { AminoMsg, makeSignDoc as makeSignDocAmino } from "@cosmjs/amino";
import equals from "fast-deep-equal";
import { isNonNullObject } from "@cosmjs/utils";

import { OfflineAminoSigner } from "../amino/signer";
import { makeStdTx, StdTx } from "@cosmjs/launchpad/build/tx";

import { isSecp256k1Pubkey, serializeSignDoc } from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import { Secp256k1, Secp256k1Signature } from "@cosmjs/crypto";
import { arrayContentEquals } from "@cosmjs/utils";

import { fromBase64 } from "@cosmjs/encoding";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";

export interface SignerData {
    readonly accountNumber: number;
    readonly sequence: number;
    readonly chainId: string;
}

export interface SequenceResponse {
    readonly accountNumber: number;
    readonly sequence: number;
}

/**
 * See ADR-036
 */
export interface MsgSignData extends AminoMsg {
    readonly type: "sign/MsgSignData";
    readonly value: {
        /** Bech32 account address */
        signer: string;
        /** Base64 encoded data */
        data: string;
    };
}

export function isMsgSignData(msg: AminoMsg): msg is MsgSignData {
    const castedMsg = msg as MsgSignData;
    if (castedMsg.type !== "sign/MsgSignData") return false;
    if (!isNonNullObject(castedMsg.value)) return false;
    if (typeof castedMsg.value.signer !== "string") return false;
    if (typeof castedMsg.value.data !== "string") return false;
    return true;
}


export class SigningAminoStargateClient extends StargateClient {

    private readonly signer: OfflineAminoSigner;

    private static _endpoint = "";

    static async connectWithSigner(endpoint: string, signer: OfflineAminoSigner, registry: Registry):
        Promise<SigningAminoStargateClient> {

        this._endpoint = endpoint;
        const tmClient = await Tendermint34Client.connect(endpoint);
        return new SigningAminoStargateClient(tmClient, signer);
    }

    protected constructor(tmClient: Tendermint34Client | undefined, signer: OfflineAminoSigner) {
        super(tmClient);
        this.signer = signer;
    }

    public async experimentalAdr36Sign(signerAddress: string, data: Uint8Array | Uint8Array[]): Promise<StdTx> {
        const accountNumber = 0;
        const sequence = 0;
        const chainId = "";
        const fee: StdFee = {
            gas: "0",
            amount: [],
            granter: "" // added by DH
        };
        const memo = "";

        const datas = Array.isArray(data) ? data : [data];

        const msgs: MsgSignData[] = datas.map(
            (d): MsgSignData => ({
                type: "sign/MsgSignData",
                value: {
                    signer: signerAddress,
                    data: toBase64(d),
                },
            }),
        );

        const accountFromSigner = (await this.signer.getAccounts()).find(
            (account) => account.address === signerAddress,
        );

        if (!accountFromSigner) {
            throw new Error("Failed to retrieve account from signer");
        }

        let signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence);

        const { signature, signed } = await this.signer.signAmino(signerAddress, signDoc);
        if (!equals(signDoc, signed)) {
            throw new Error(
                "The signed document differs from the signing instruction. This is not supported for ADR-036.",
            );
        }

        return makeStdTx(signDoc, signature);
    }

    static async experimentalAdr36Verify(signed: StdTx): Promise<boolean> {

        // Restrictions from ADR-036
        if (signed.memo !== "") throw new Error("Memo must be empty.");
        if (signed.fee.gas !== "0") throw new Error("Fee gas must 0.");
        if (signed.fee.amount.length !== 0) throw new Error("Fee amount must be an empty array.");

        const accountNumber = 0;
        const sequence = 0;
        const chainId = "";

        // Check `msg` array
        const signedMessages = signed.msg;
        if (!signedMessages.every(isMsgSignData)) {
            throw new Error(`Found message that is not the expected type.`);
        }
        if (signedMessages.length === 0) {
            throw new Error("No message found. Without messages we cannot determine the signer address.");
        }

        // TODO: restrict number of messages?

        const signatures = signed.signatures;
        if (signatures.length !== 1) throw new Error("Must have exactly one signature to be supported.");
        const signature = signatures[0];
        if (!isSecp256k1Pubkey(signature.pub_key)) {
            throw new Error("Only secp256k1 signatures are supported.");
        }

        const signBytes = serializeSignDoc(
            makeSignDocAmino(signed.msg, signed.fee, chainId, signed.memo, accountNumber, sequence),
        );
        const prehashed = sha256(signBytes);

        const secpSignature = Secp256k1Signature.fromFixedLength(fromBase64(signature.signature));
        const rawSecp256k1Pubkey = fromBase64(signature.pub_key.value);
        const rawSignerAddress = rawSecp256k1PubkeyToRawAddress(rawSecp256k1Pubkey);

        if (
            signedMessages.some(
                (msg) => !arrayContentEquals(Bech32.decode(msg.value.signer).data, rawSignerAddress),
            )
        ) {
            throw new Error("Found mismatch between signer in message and public key");
        }

        const ok = await Secp256k1.verifySignature(secpSignature, prehashed, rawSecp256k1Pubkey);
        return ok;
    }

    
    /**
   * Takes a bech32 encoded address and returns the data part. The prefix is ignored and discarded.
   * This is called AccAddress in Cosmos SDK, which is basically an alias for raw binary data.
   * The result is typically 20 bytes long but not restricted to that.
   */
    private toAccAddress(address: string): Uint8Array {
        return Bech32.decode(address).data;
    }

    async getAccount(address: string): Promise<Account | undefined> {
        // http://192.168.126.130:26657/abci_query?path=%22/store/acc/key%22&data=0x017763cada6ef547429c1c6088d663b55021bb6a43

        try {

            const accAddress = this.toAccAddress(address);
            const hexAccAddress = `0x01${Buffer.from(accAddress).toString("hex")}`;

            const axios = Axios.create({
                baseURL: SigningAminoStargateClient._endpoint,
                headers: {
                    Accept: "application/json",
                },
                timeout: 15000
            });

            const path = "/abci_query?path=\"/store/acc/key\"";
            const result = await axios.get(path, { params: { data: hexAccAddress } });

            const finalData = result.data.result.response.value;
            const account = Any.decode(Buffer.from(finalData, "base64"));

            const finalAccount = accountFromAny(account);

            return finalAccount;
        } catch (error) {
            return undefined;
        }
    }
}