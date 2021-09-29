export class FirmaConfig {
	constructor(public chainID: string,
		public rpcAddress: string,
		public restApiAddress: string,
		public ipfsNodeAddress: string,
		public ipfsNodePort: number,
		public ipfsWebApiAddress: string,
		public hdPath: string,
		public prefix: string,
		public denom: string,
		public isShowLog: boolean) {
	}

	static DevNetConfig: FirmaConfig = {
		chainID: "imperium-2",
		rpcAddress: "https://imperium-node1.firmachain.org:26657",
		restApiAddress: "https://imperium-node1.firmachain.org:1317",
		ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		isShowLog: true,
	}

	static TestNetConfig: FirmaConfig = {
		chainID: "colosseum-1",
		rpcAddress: "https://imperium-node1.firmachain.org:26657",
		restApiAddress: "https://imperium-node1.firmachain.org:1317",
		ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		isShowLog: true,
	}

	static MainNetConfig: FirmaConfig = {
		chainID: "augutus-2",
		rpcAddress: "https://imperium-node1.firmachain.org:26657",
		restApiAddress: "https://imperium-node1.firmachain.org:1317",
		ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		isShowLog: false,
	}
}

