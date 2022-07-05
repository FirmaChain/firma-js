import { FirmaConfig } from "./FirmaConfig";
import fs from "fs";
import { FirmaUtil } from "./FirmaUtil";
import axios from "axios";

export class IpfsService {

    constructor(private readonly config: FirmaConfig) {
     
    }

    private getBasePostUrl() : string{
        return this.config.ipfsNodeAddress + ":" + this.config.ipfsNodePort + "/api/v0/add"
    }

    async addJson(jsonData: string): Promise<string> {

        try {

            const FormData = require('form-data');
		    var bodyData = new FormData();
    		bodyData.append('json', jsonData);

            const response = await axios.request({
                url: this.getBasePostUrl(),
                method: 'POST',
                headers: bodyData.getHeaders(),
                data: bodyData
              });

            return response.data.Hash;
	
        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async addBuffer(buffer: ArrayBuffer): Promise<string> {

        try {
            const FormData = require('form-data');
		    var bodyData = new FormData();
    		bodyData.append('buffer', Buffer.from(buffer));

            const response = await axios.request({
                url: this.getBasePostUrl(),
                method: 'POST',
                headers: bodyData.getHeaders(),
                data: bodyData
              });

            return response.data.Hash;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async addFile(fileUrl: string): Promise<string> {

        try {
            const FormData = require('form-data');
		    var bodyData = new FormData();

            let fileBuffer = fs.readFileSync(fileUrl);
    		bodyData.append('file', fileBuffer);

            const response = await axios.request({
                url: this.getBasePostUrl(),
                method: 'POST',
                headers: bodyData.getHeaders(),
                data: bodyData
              });

            return response.data.Hash;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    getURLFromHash(hash: string) {
        return this.config.ipfsWebApiAddress + "/ipfs/" + hash;
    }
}