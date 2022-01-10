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
		public defaultFee: number,
		public defaultGas: number,
		public isShowLog: boolean) {
	}

	static readonly DevNetConfig: FirmaConfig = {
		chainID: "roma-1",
		rpcAddress: "http://192.168.20.113:26657",
		restApiAddress: "http://192.168.20.113:1317",
		ipfsNodeAddress: "http://192.168.20.120",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "http://192.168.20.120:8080",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		defaultFee: 20000,
		defaultGas: 200000,
		isShowLog: true,
	  }

	static readonly TestNetConfig: FirmaConfig = {
		chainID: "imperium-3",
		rpcAddress: "https://lcd-testnet.firmachain.dev:26657",
		restApiAddress: "https://lcd-testnet.firmachain.dev:1317",
		ipfsNodeAddress: "https://ipfs-dev.firmachain.dev",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-dev.firmachain.dev",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		defaultFee: 20000,
		defaultGas: 200000,
		isShowLog: true,
	}

	static readonly MainNetConfig: FirmaConfig = {
		chainID: "colosseum-1",
		rpcAddress: "https://lcd-mainnet.firmachain.org:26657",
		restApiAddress: "https://lcd-mainnet.firmachain.org:1317",
		ipfsNodeAddress: "https://ipfs-dev.firmachain.dev",
		ipfsNodePort: 5001,
		ipfsWebApiAddress: "https://ipfs-dev.firmachain.dev",
		hdPath: "m/44'/7777777'/",
		prefix: "firma",
		denom: "ufct",
		defaultFee: 20000,
		defaultGas: 200000,
		isShowLog: false,
	}
}

