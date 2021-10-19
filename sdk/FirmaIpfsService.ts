import { FirmaConfig } from "./FirmaConfig";
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import fs from "fs";
import { FirmaUtil } from "./FirmaUtil";

export class IpfsService {

    private ipfsNodeClient: IPFSHTTPClient;
    private readonly protocol: string;

    constructor(private readonly config: FirmaConfig) {

        if (config.ipfsNodeAddress.includes("https://")) {
            this.protocol = "https";
        } else if (config.ipfsNodeAddress.includes("http://")) {
            this.protocol = "http";
        } else {
            this.protocol = "https";
        }

        let address = config.ipfsNodeAddress;
        address = address.replace("https://", "");
        address = address.replace("http://", "");

        this.ipfsNodeClient = create({ host: address, port: config.ipfsNodePort, protocol: this.protocol });
    }

    async addJson(jsonData: string): Promise<string> {

        try {
            const result = await this.ipfsNodeClient.add(jsonData);
            return result.cid.toString();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async addBuffer(buffer: ArrayBuffer): Promise<string> {

        try {
            const result = await this.ipfsNodeClient.add(buffer);
            return result.cid.toString();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async addFile(fileUrl: string): Promise<string> {

        try {
            const data = fs.readFileSync(fileUrl);
            const result = await this.ipfsNodeClient.add(data);

            return result.cid.toString();
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getFile(hash: string): Promise<string> {

        try {
            const stream = this.ipfsNodeClient.get(hash);
            let data = "";

            // CHECK: output data is string. is ok?
            // chunks of data are returned as a Buffer, convert it back to a string
            for await (const chunk of stream) {
                data += chunk.toString();
            }

            return data;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    getURLFromHash(hash: string) {
        return this.config.ipfsWebApiAddress + "/ipfs/" + hash;
    }
}