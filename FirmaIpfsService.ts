import { FirmaConfig } from "./FirmaConfig";
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import fs from 'fs';
import { FirmaUtil } from "./FirmaUtil";

export class IpfsService {

    private _ipfsNodeClient: IPFSHTTPClient;
    private _protocol: string;

    constructor(private _config: FirmaConfig) {

        if (_config.ipfsNodeAddress.includes("https://")) {
            this._protocol = "https";
        } else if (_config.ipfsNodeAddress.includes("http://")) {
            this._protocol = "http";
        }
        else {
            this._protocol = "https";
        }

        let address = _config.ipfsNodeAddress;
        address = address.replace("https://", "");
        address = address.replace("http://", "");

        this._ipfsNodeClient = create({ host: address, port: _config.ipfsNodePort, protocol: this._protocol });
    }

    public async addJson(jsonData: string): Promise<string> {

        try {
            var result = await this._ipfsNodeClient.add(jsonData);
            return result.cid.toString();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    public async addBuffer(buffer: ArrayBuffer): Promise<string> {

        try {
            var result = await this._ipfsNodeClient.add(buffer);
            return result.cid.toString();

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    public async addFile(fileUrl: string): Promise<string> {

        try {
            var data = fs.readFileSync(fileUrl);
            var result = await this._ipfsNodeClient.add(data);

            return result.cid.toString();
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    public async getFile(hash: string): Promise<string> {

        try {
            var stream = this._ipfsNodeClient.get(hash);
            var data = "";

            // CHECK: output data is string. is ok?
            // chunks of data are returned as a Buffer, convert it back to a string
            for await (const chunk of stream) {
                data += chunk.toString()
            }

            return data;
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    public getURLFromHash(hash: string) {
        return this._config.ipfsWebApiAddress + "/ipfs/" + hash;
    }
}

