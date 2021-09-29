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

	static LoopbackDevNetConfig: FirmaConfig = {
		chainID: "imperium-2",
		rpcAddress: "http://0.0.0.0:26657",
		restApiAddress: "http://0.0.0.0:1317",
		ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
		hdPath: "m/44'/118'/",
		prefix: "firma",
		denom: "ufct",
		isShowLog: true,
	}

	// 192.168.20.108

	static LocalDevNetConfig: FirmaConfig = {
		chainID: "imperium-2",
		rpcAddress: "http://192.168.20.108:26657",
		restApiAddress: "http://192.168.20.108:1317",
		ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		isShowLog: true,
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

	static MainNetConfig: FirmaConfig = {
		chainID: "imperium-2",
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

