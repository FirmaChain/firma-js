import { FirmaConfig } from "./FirmaConfig";
import { FirmaBankService } from "./FirmaBankService";
import { FirmaFeeGrantService } from "./FirmaFeeGrantService";
import { FirmaStakingService } from "./FirmaStakingService";
import { FirmaDistributionService } from "./FirmaDistributionService";
import { NftService } from "./FirmaNftService";
import { TokenService } from "./FirmaTokenService";
import { ContractService } from "./FirmaContractService";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";
import { FirmaGovService } from "./FirmaGovService";
import { ChainService } from "./FirmaChainService";
import { SlashingService } from "./FirmaSlashingService";
import { FirmaAuthzService } from "./FirmaAuthzService";

export class FirmaMobileSDK {
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
        public BlockChain: ChainService = new ChainService(Config),
        public Slashing: SlashingService = new SlashingService(Config),
        public Authz: FirmaAuthzService = new FirmaAuthzService(Config)) {

        FirmaUtil.config = Config;
    }
}


