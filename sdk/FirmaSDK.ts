import { FirmaConfig } from "./FirmaConfig";
import { FirmaBankService } from "./FirmaBankService";
import { FirmaFeeGrantService } from "./FirmaFeeGrantService";
import { FirmaStakingService } from "./FirmaStakingService";
import { FirmaDistributionService } from "./FirmaDistributionService";
import { NftService } from "./FirmaNftService";
import { TokenService } from "./FirmaTokenService";
import { ContractService } from "./FirmaContractService";
import { IpfsService } from "./FirmaIpfsService";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { FirmaGovService } from "./FirmaGovService";
import { ChainService } from "./FirmaChainService";
import { SlashingService } from "./FirmaSlashingService";
import { FirmaAuthzService } from "./FirmaAuthzService";
import { FirmaCosmWasmService } from "./FirmaCosmWasmService";
import { FirmaIbcService } from "./FirmaIbcService";

export class FirmaSDK {
    constructor(public Config: FirmaConfig,
        public Wallet: FirmaWalletService = new FirmaWalletService(Config),
        public Bank: FirmaBankService = new FirmaBankService(Config),
        public FeeGrant: FirmaFeeGrantService = new FirmaFeeGrantService(Config),
        public Staking: FirmaStakingService = new FirmaStakingService(Config),
        public Distribution: FirmaDistributionService = new FirmaDistributionService(Config),
        public Gov: FirmaGovService = new FirmaGovService(Config),
        public Nft: NftService = new NftService(Config),
        public Token: TokenService = new TokenService(Config),
        public Contract: ContractService = new ContractService(Config),
        public Ipfs: IpfsService = new IpfsService(Config),
        public BlockChain: ChainService = new ChainService(Config),
        public Slashing: SlashingService = new SlashingService(Config),
        public Authz: FirmaAuthzService = new FirmaAuthzService(Config),
        public CosmWasm: FirmaCosmWasmService = new FirmaCosmWasmService(Config),
        public Ibc: FirmaIbcService = new FirmaIbcService(Config),
        ) {

        FirmaUtil.config = Config;
    }
}


