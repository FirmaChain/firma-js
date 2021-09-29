import { FirmaConfig } from "../sdk/FirmaConfig"

export const TestChainConfig: FirmaConfig = {
	chainID: "imperium-2",
	rpcAddress: "http://192.168.100.107:26657",
	restApiAddress: "http://192.168.100.107:1317",
	ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
	ipfsNodePort: 5001,
	ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
	hdPath: "m/44'/118'/",
	prefix: "firma",
	denom: "ufct",
	isShowLog: true,
}