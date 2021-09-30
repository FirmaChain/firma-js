import { FirmaConfig } from "../sdk/FirmaConfig"

export const TestChainConfig: FirmaConfig = {
	chainID: "imperium-2",
	rpcAddress: "http://192.168.20.110:26657",
	restApiAddress: "http://192.168.20.110:1317",
	ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
	ipfsNodePort: 5001,
	ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
	hdPath: "m/44'/7777777'/",
	prefix: "firma",
	denom: "ufct",
	isShowLog: true,
}

export const aliceMnemonic = "ozone unfold device pave lemon potato omit insect column wise cover hint narrow large provide kidney episode clay notable milk mention dizzy muffin crazy";
export const bobMnemonic = "burst torch enemy quick crime slogan trust wood hamster way armor visual common language close park leg ill ball board couch nose theory must";