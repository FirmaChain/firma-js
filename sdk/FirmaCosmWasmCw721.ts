import { FirmaConfig } from "./FirmaConfig";

import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaWalletService } from "./FirmaWalletService";
import { DefaultTxMisc, FirmaUtil } from "./FirmaUtil";
import { TxMisc } from "./firmachain/common";

export interface ExpiresAtHeight {
    at_height: number;
}

export interface ExpiresAtTime {
    at_time: number; // Unix timestamp
}

export interface ExpiresNever {
    never: {};
}

export type Expires = ExpiresAtHeight | ExpiresAtTime | ExpiresNever;

interface OwnershipResponse {
    owner: string | null;
    pending_owner: string | null;
    pending_expiry: Expires | null;
}

export interface Cw721NftInfo {
    access: {
        owner: string;
        approvals: Cw721Approval[];
    }

    info: {
        token_uri: string;
        extension: Object;
    }
}

export interface Cw721ContractInfo {
    name: string;
    symbol: string;
}

export interface Cw721Approval {
    spender: string,
    expires: Expires;
}

// staic util
const noFunds: any = [];

function getMsgDataMint(owner: string, token_id: string, token_uri: string) {
    return JSON.stringify({
        "mint": {
            token_id,
            owner,
            extension: {},
            token_uri
        }
    });
}

function getMsgDataBurn(token_id: string) {
    return JSON.stringify({
        "burn": {
            token_id
        }
    });
}

function getMsgDataTransfer(recipient: string, token_id: string) {
    return JSON.stringify({
        "transfer_nft": {
            recipient,
            token_id
        }
    });
}

function getMsgDataApprove(spender: string, token_id: string, expires: Expires) {
    return JSON.stringify({
        "approve": {
            spender,
            token_id,
            expires
        }
    });
}

function getMsgDataRevoke(spender: string, token_id: string) {
    return JSON.stringify({
        "revoke": {
            spender,
            token_id
        }
    });
}

function getMsgDataApproveAll(operator: string, expires: Expires) {
    return JSON.stringify({
        "approve_all": {
            operator,
            expires
        }
    });
}

function getMsgDataRevokeAll(operator: string) {
    return JSON.stringify({
        "revoke_all": {
            operator
        }
    });
}

function getMsgDataSendNft(contract: string, token_id: string, msg: any) {
    return JSON.stringify({
        "send_nft": {
            contract,
            token_id,
            msg: btoa(JSON.stringify(msg))
        }
    });
}

function getMsgUpdateOwnerShipTransfer(new_owner: string, expiry: Expires) {
    return JSON.stringify({
        "update_ownership": {
            "transfer_ownership": {
                new_owner,
                expiry
            }
        }
    });
}

function getMsgUpdateOwnerShipAccept() {
    return JSON.stringify({
        "update_ownership": "accept_ownership"
    });
}

function getMsgUpdateOwnerShipRenounce() {
    return JSON.stringify({
        "update_ownership": "renounce_ownership"
    });
}

export class FirmaCosmWasmCw721Service {

    constructor(private readonly config: FirmaConfig, private readonly cosmwasmService: FirmaCosmWasmService) { }

    // tx
    async mint(wallet: FirmaWalletService, contractAddress: string, owner: string, token_id: string, token_uri: string = "", txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataMint(owner, token_id, token_uri);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async burn(wallet: FirmaWalletService, contractAddress: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataBurn(token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async transfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataTransfer(recipient, token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async approve(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataApprove(spender, token_id, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async revoke(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataRevoke(spender, token_id);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async approveAll(wallet: FirmaWalletService, contractAddress: string, operator: string, expires: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataApproveAll(operator, expires);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async revokeAll(wallet: FirmaWalletService, contractAddress: string, operator: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataRevokeAll(operator);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async sendNft(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, token_id: string, msg: any, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgDataSendNft(targetContractAddress, token_id, msg);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async updateOwnerShipTransfer(wallet: FirmaWalletService, contractAddress: string, new_owner: string, expiry: Expires, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgUpdateOwnerShipTransfer(new_owner, expiry);
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async updateOwnerShipAccept(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgUpdateOwnerShipAccept();
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    async updateOwnerShipRenounce(wallet: FirmaWalletService, contractAddress: string, txMisc: TxMisc = DefaultTxMisc) {
        const msgData = getMsgUpdateOwnerShipRenounce();
        return await this.cosmwasmService.executeContract(wallet, contractAddress, msgData, noFunds, txMisc);
    }

    // gas
    async getGasEstimationMint(wallet: FirmaWalletService, contractAddress: string, owner: string, token_id: string, token_uri: string = ""): Promise<number> {
        const msgData = getMsgDataMint(owner, token_id, token_uri);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationBurn(wallet: FirmaWalletService, contractAddress: string, token_id: string): Promise<number> {
        const msgData = getMsgDataBurn(token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationTransfer(wallet: FirmaWalletService, contractAddress: string, recipient: string, token_id: string): Promise<number> {
        const msgData = getMsgDataTransfer(recipient, token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationApprove(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string, expires: Expires): Promise<number> {
        const msgData = getMsgDataApprove(spender, token_id, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRevoke(wallet: FirmaWalletService, contractAddress: string, spender: string, token_id: string): Promise<number> {
        const msgData = getMsgDataRevoke(spender, token_id);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationApproveAll(wallet: FirmaWalletService, contractAddress: string, operator: string, expires: Expires): Promise<number> {
        const msgData = getMsgDataApproveAll(operator, expires);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationRevokeAll(wallet: FirmaWalletService, contractAddress: string, operator: string): Promise<number> {
        const msgData = getMsgDataRevokeAll(operator);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationSendNft(wallet: FirmaWalletService, contractAddress: string, targetContractAddress: string, token_id: string, msg: any): Promise<number> {
        const msgData = getMsgDataSendNft(targetContractAddress, token_id, msg);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipTransfer(wallet: FirmaWalletService, contractAddress: string, new_owner: string, expiry: Expires): Promise<number> {
        const msgData = getMsgUpdateOwnerShipTransfer(new_owner, expiry);
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipAccept(wallet: FirmaWalletService, contractAddress: string): Promise<number> {
        const msgData = getMsgUpdateOwnerShipAccept();
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    async getGasEstimationUpdateOwnerShipRenounce(wallet: FirmaWalletService, contractAddress: string): Promise<number> {
        const msgData = getMsgUpdateOwnerShipRenounce();
        return await this.cosmwasmService.getGasEstimationExecuteContract(wallet, contractAddress, msgData, noFunds);
    }

    // query
    async getOwnerFromNftID(contractAddress: string, tokenId: string): Promise<string> {
        try {

            const query = `{"owner_of": { "token_id": "${tokenId}" }}`;
            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.owner;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getApproval(contractAddress: string, tokenId: string, spender: string, isIncludeExpired: boolean = false): Promise<Cw721Approval> {
        try {

            const query = `{"approval": { "token_id": "${tokenId}", "spender" : "${spender}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approval;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getApprovals(contractAddress: string, tokenId: string, isIncludeExpired: boolean = false): Promise<Cw721Approval[]> {
        try {

            const query = `{"approvals": { "token_id": "${tokenId}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approvals;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getAllOperators(contractAddress: string, owner: string, isIncludeExpired: boolean = false): Promise<Cw721Approval[]> {
        try {

            const query = `{"all_operators": { "owner": "${owner}", "include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.operators;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getOperator(contractAddress: string, owner: string, operator: string, isIncludeExpired: boolean = false): Promise<Cw721Approval> {
        try {

            const query = `{"operator": { "owner": "${owner}", "operator": "${operator}" ,"include_expired" : ${isIncludeExpired} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.approval;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getTotalNfts(contractAddress: string): Promise<number> {
        try {

            const query = `{"num_tokens": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.count;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getContractInfo(contractAddress: string): Promise<Cw721ContractInfo> {
        try {

            const query = `{"contract_info": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftTokenUri(contractAddress: string, tokenId: string): Promise<string> {
        try {

            const query = `{"nft_info": { "token_id": "${tokenId}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.token_uri;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNftData(contractAddress: string, tokenId: string): Promise<Cw721NftInfo> {
        try {
            const query = `{"all_nft_info": { "token_id": "${tokenId}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getNFTIdListOfOwner(contractAddress: string, owner: string): Promise<string[]> {
        try {

            const query = `{"tokens": { "owner": "${owner}" }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    // TODO: for many items, limit, start_after can be added later
    async getAllNftIdList(contractAddress: string): Promise<string[]> {
        try {


            const query = `{"all_tokens": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.tokens;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getMinter(contractAddress: string): Promise<string> {
        try {

            const query = `{"minter": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data.minter;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getExtension(contractAddress: string) {
        try {

            const query = `{"extension": { "msg": {} }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }

    async getOwnerShip(contractAddress: string): Promise<OwnershipResponse> {
        try {
            const query = `{"ownership": { }}`;

            const result = await this.cosmwasmService.getContractSmartQueryData(contractAddress, query);
            const data = JSON.parse(result);

            return data;

        } catch (error) {
            FirmaUtil.printLog(error);
            throw error;
        }
    }
}