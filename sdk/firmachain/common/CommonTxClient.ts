import { Registry, EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { MsgSend, MsgMultiSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { MsgFundCommunityPool, MsgSetWithdrawAddress, MsgWithdrawDelegatorReward, MsgWithdrawValidatorCommission } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgBeginRedelegate, MsgCreateValidator, MsgDelegate, MsgEditValidator, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgStoreCode, MsgInstantiateContract, MsgExecuteContract, MsgUpdateAdmin, MsgClearAdmin, MsgMigrateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { FirmaWalletService } from "../../FirmaWalletService";
import { MsgExec, MsgGrant, MsgRevoke } from "../authz/AuthzTxTypes";
import { MsgCreateContractFile, MsgAddContractLog } from "../contract/ContractTxTypes";
import { MsgGrantAllowance, MsgRevokeAllowance } from "../feegrant/FeeGrantTxTypes";
import { MsgTransfer, MsgMint, MsgBurn } from "../nft/NftTxTypes";
import { MsgCreateToken, MsgUpdateTokenURI } from "../token/TokenTxTypes";
import { ITxClient } from "./ITxClient";

const types = [
    ["/cosmos.authz.v1beta1.MsgExec", MsgExec],
    ["/cosmos.authz.v1beta1.MsgGrant", MsgGrant],
    ["/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke],

    ["/cosmos.bank.v1beta1.MsgSend", MsgSend],
    ["/cosmos.bank.v1beta1.MsgMultiSend", MsgMultiSend],

    ["/firmachain.contract.MsgCreateContractFile", MsgCreateContractFile],
    ["/firmachain.contract.MsgAddContractLog", MsgAddContractLog],

    ["/cosmwasm.wasm.v1.MsgStoreCode", MsgStoreCode],
    ["/cosmwasm.wasm.v1.MsgInstantiateContract", MsgInstantiateContract],
    ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract],

    ["/cosmwasm.wasm.v1.MsgUpdateAdmin", MsgUpdateAdmin],
    ["/cosmwasm.wasm.v1.MsgClearAdmin", MsgClearAdmin],
    ["/cosmwasm.wasm.v1.MsgMigrateContract", MsgMigrateContract],

    ["/cosmos.distribution.v1beta1.MsgFundCommunityPool", MsgFundCommunityPool],
    ["/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", MsgSetWithdrawAddress],
    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", MsgWithdrawDelegatorReward],
    ["/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission],

    ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", MsgGrantAllowance],
    ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", MsgRevokeAllowance],

    ["/cosmos.gov.v1beta1.MsgDeposit", MsgDeposit],
    ["/cosmos.gov.v1beta1.MsgSubmitProposal", MsgSubmitProposal],
    ["/cosmos.gov.v1beta1.MsgVote", MsgVote],

    ["/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer],

    ["/firmachain.nft.MsgTransfer", MsgTransfer],
    ["/firmachain.nft.MsgMint", MsgMint],
    ["/firmachain.nft.MsgBurn", MsgBurn],

    ["/cosmos.staking.v1beta1.MsgDelegate", MsgDelegate],
    ["/cosmos.staking.v1beta1.MsgUndelegate", MsgUndelegate],
    ["/cosmos.staking.v1beta1.MsgBeginRedelegate", MsgBeginRedelegate],
    ["/cosmos.staking.v1beta1.MsgEditValidator", MsgEditValidator],
    ["/cosmos.staking.v1beta1.MsgCreateValidator", MsgCreateValidator],

    ["/firmachain.token.MsgCreateToken", MsgCreateToken],
    ["/firmachain.token.MsgUpdateTokenURI", MsgUpdateTokenURI],
    ["/firmachain.token.MsgMint", MsgMint],
    ["/firmachain.token.MsgBurn", MsgBurn]
    
];

const registry = new Registry(types as any);

export class CommonTxClient extends ITxClient {

    constructor(wallet: FirmaWalletService, address: string) {
        super(wallet, address, registry);
    }

    static getRegistry() : Registry {
        return registry;
    }
}