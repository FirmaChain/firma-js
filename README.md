# firma-js

[![npm version](https://badge.fury.io/js/%40firmachain%2Ffirma-js.svg)](https://badge.fury.io/js/%40firmachain%2Ffirma-js)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/firmachain/firma-js)](https://github.com/firmachain/firma-js/releases)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/firmachain/firma-js/blob/master/LICENSE)
![Lines of code](https://img.shields.io/tokei/lines/github/firmachain/firma-js)

The Javascript & TypeScript SDK for FirmaChain

Firma-js is a SDK for writing applications based on javascript & typescript. You can use it client web app or Node.js. This SDK is created inspired by cosmjs and several sdk. All functions of the FirmaChain can be accessed at the service level.

## Features
 Most cosmos sdk features are supported
- Wallet / Bank
- Nft / Contract
- Ipfs / Gov
- Staking / Distribution
- Feegrant ...and so one

</br>


## Install
You can install `firma-js` using [NPM](https://www.npmjs.com/package/@firmachain/firma-js)
```
yarn add @firmachain/firma-js
```
or
```
npm i @firmachain/firma-js
```

## Usage
### Initializing SDK
```js
import { FirmaSDK } from "@firmachain/firma-js"
import { FirmaConfig } from "@firmachain/firma-js"

// use preset config
const firma = new FirmaSDK(FirmaConfig.TestNetConfig);

// or use custom set
let chainConfig = {
    chainID: "imperium-2",
    rpcAddress: "http://127.0.0.1:26657",
    restApiAddress: "http://127.0.0.1:1317",
    ipfsNodeAddress: "ipfs-api-firma-devnet.firmachain.org",
    ipfsNodePort: 5001,
    ipfsWebApiAddress: "https://ipfs-firma-devnet.firmachain.org",
    hdPath: "m/44'/7777777'/",
    prefix: "firma",
    denom: "ufct",
    isShowLog: true,
}

const firma = new FirmaSDK(chainConfig);

```

### Create wallet account
```js
// create new wallet
const newWallet = await firma.Wallet.newWallet();

// generateMnemonic
const mnemonic = await firma.Wallet.generateMnemonic();
const index = 0;

// or from mnemonic
const wallet = await firma.Wallet.fromMnemonic(mnemonic, index);
console.log(await wallet.getAddress());
```

### Import account by private key
```js
const privateKey = wallet.getPrivateKey();
const wallet1 = await firma.Wallet.fromPrivateKey(privateKey);
```

### Get chaion status (include height, time etc)
```js
const result = await firma.Chain.getChainStatus();
console.log(result);
```

### Get FIRMA balance of specific account
```js
const address = await wallet.getAddress();
const balance = await firma.Bank.getBalance(address);
console.log("balance: " + balance);
```

### Get transaction by hash
```js
const txHash = "0xC5509A32CF57798F8C3185DFAF03BD2D09DFC04FE842283ECA9298F5F60E340F";
const result = await firma.Chain.getTransactionByHash(txHash);
console.log(result);
```

### Bank send - create tx and broadcast
```js
const fctAmount = 10;
let result = await firma.Bank.send(wallet, address, fctAmount);
```

### Bank send - extended version
```js
const fctAmount = 10;
let result = await firma.Bank.send(wallet, address, fctAmount, { memo: "", fee: 3000, gas: 200000 });
```

### Calculate gas
```js
let gas = await firma.Bank.getGasEstimationSend(wallet, address, fctAmount);
```

### Mint NFT
```js
const tokenURI = "https://ipfs-firma-devnet.firmachain.org/ipfs/QmYsezxzunake9EmyoU4HsWKEyHQLgE3syTEpTSQEhNChA";
let result = await firma.Nft.mint(wallet, tokenURI);
```

### Transfer NFT
```js
const tokenId = 1;
let result = await firma.Nft.transfer(wallet, address, tokenId);
```

### Burn NFT
```js
const tokenId = 1;
let result = await firma.Nft.burn(wallet, tokenId);
```

You can see everything usage of firma-js on the test folder.
</br>
https://github.com/FirmaChain/firma-js/tree/main/test