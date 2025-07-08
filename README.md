# firma-js

[![npm version](https://badge.fury.io/js/%40firmachain%2Ffirma-js.svg)](https://badge.fury.io/js/%40firmachain%2Ffirma-js)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/firmachain/firma-js)](https://github.com/firmachain/firma-js/releases)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/firmachain/firma-js/blob/master/LICENSE)
[![](https://tokei.rs/b1/github/XAMPPRocky/tokei)](https://github.com/FirmaChain/firma-js)

**The Official JavaScript & TypeScript SDK for FirmaChain**

Firma-js is a comprehensive SDK for building applications on the FirmaChain blockchain using JavaScript and TypeScript. Whether you're developing client-side web applications or server-side Node.js applications, this SDK provides seamless integration with FirmaChain's full suite of blockchain capabilities.

Built with inspiration from CosmJS and other leading Cosmos SDK implementations, firma-js offers a service-oriented architecture that provides direct access to all FirmaChain functionality while maintaining type safety and developer experience.

## Features

**Core FirmaChain Integration**
- **Wallet Management**: Create, import, and manage wallets with mnemonic and private key support
- **Banking Operations**: Send, receive, and query FCT with full transaction control
- **Staking & Delegation**: Stake tokens, delegate to validators, and manage rewards
- **Authorization**: Grant and revoke permissions for account delegation
- **Fee Grant**: Grant and revoke fee allowances for gasless transactions
- **Governance**: Create proposals, vote, and query governance parameters

**FirmaChain Ecosystem**
- **Smart Contracts**: Deploy, execute, and query CosmWasm smart contracts with full parameter control
- **IBC Operations**: Cross-chain transfers and communication protocols
- **IPFS Integration**: Upload, pin, and retrieve files from IPFS with built-in gateway support
- **NFT Operations**: Mint, transfer, burn, and query built-in NFTs with comprehensive metadata support

**Developer Experience**
- **TypeScript Support**: Full type definitions for enhanced IDE support and compile-time safety
- **Modular Architecture**: Use only the modules you need for optimal bundle size
- **Comprehensive Documentation**: Extensive examples and API documentation
- **CosmJS Compatible**: Familiar patterns for developers experienced with Cosmos SDK

## Install
You can install `firma-js` using [NPM](https://www.npmjs.com/package/@firmachain/firma-js)
```
yarn add @firmachain/firma-js
```
or
```
npm i @firmachain/firma-js
```

## Conventions

### Implementation Guidelines
- **Data Structure Consistency**: We recommend preserving the original data structure from FirmaChain RPCs throughout your application and only processing/transforming the data immediately before transaction generation. This convention is also applied to `firma-js` itself.
- **Chain Data Integrity**: This approach ensures consistency in chain data retrieval logic and maintains compatibility with upstream changes
- **Transaction Processing**: All data transformations should occur at the transaction boundary to minimize potential inconsistencies

### Governance Parameters
- **Parameter Validation**: For governance proposals requiring multiple parameters, we perform dual validation by comparing submitted parameters against `fromPartial`-processed parameters to ensure identical values
- **Validation Failure Handling**: If any discrepancy is detected between the original and processed parameters, the transaction will automatically revert to prevent malformed proposals
- **Best Practice**: To ensure successful governance proposal submissions, use the provided helper functions:
  - `getParamAsGovParams()` - Retrieve current governance parameters
  - `getParamsAsStakingParams()` - Retrieve current staking parameters
  
  Modify only the specific fields you need to change while preserving all other existing parameter values 


## Usage
### Initializing SDK
```js
import { FirmaSDK } from "@firmachain/firma-js"
import { FirmaConfig } from "@firmachain/firma-js"

// use preset config : testnet
const firma = new FirmaSDK(FirmaConfig.TestNetConfig);

// use preset config : mainnet
const firma = new FirmaSDK(FirmaConfig.MainNetConfig);

// or use custom set

let chainConfig = {
   chainID: "colosseum-1",
   rpcAddress: "https://lcd-mainnet.firmachain.dev:26657",
   restApiAddress: "https://lcd-mainnet.firmachain.dev:1317",
   ipfsNodeAddress: "https://ipfs-dev.firmachain.dev",
   ipfsNodePort: 5001,
   ipfsWebApiAddress: "https://ipfs-dev.firmachain.dev",
   hdPath: "m/44'/7777777'/",
   prefix: "firma",
   denom: "ufct",
   defaultFee: 30000,
   defaultGas: 300000,
   isShowLog: false,
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
let result = await firma.Bank.send(wallet, address, fctAmount, { memo: "", fee: 30000, gas: 300000 });
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

## Complete Examples

For comprehensive usage examples and test cases, please refer to the test suite:

🔗 **[View Complete Examples](https://github.com/FirmaChain/firma-js/tree/main/test)**

The test folder contains detailed examples for all SDK features including wallet management, token operations, NFT handling, smart contracts, governance, staking, and more.
