import { FirmaConfig } from "./FirmaConfig";
import { FirmaBankService } from "./FirmaBankService";
import { FirmaFeeGrantService } from "./FirmaFeeGrantService";
import { NftService } from "./FirmaNftService";
import { ContractService } from "./FirmaContractService";
import { IpfsService } from "./FirmaIpfsService";
import { FirmaWalletService } from "./FirmaWalletService";
import { FirmaUtil } from "./FirmaUtil";

export class FirmaSDK {
	constructor(public Config: FirmaConfig,
		public Wallet: FirmaWalletService = new FirmaWalletService(Config),
		public Bank: FirmaBankService = new FirmaBankService(Config),
		public FeeGrant: FirmaFeeGrantService = new FirmaFeeGrantService(Config),
		public Nft: NftService = new NftService(Config),
		public Contract: ContractService = new ContractService(Config),
		public Ipfs: IpfsService = new IpfsService(Config)) {
			FirmaUtil.Config = Config;
		 }
}

