# firma-js Verification Workflow

Manual runbook for verifying that firma-js works end-to-end across the three supported signing channels: **mnemonic**, **Ledger hardware wallet**, and **Station Mobile (QR-scan signing)**.

CI (`.github/workflows/ci.yml`) covers build and type-check only. Every signing-channel test below requires chain access and/or a physical device, so they must be run manually before each release.

---

## Common prerequisites

1. Copy `test/config_test.sample.ts` → `test/config_test.ts` and fill in:
   - `TestChainConfig` (`FirmaConfig.TestNetConfig` or a local chain)
   - Funded mnemonics (`validatorMnemonic`, `aliceMnemonic`, `bobMnemonic`, `feeMnemonic`, `firmaFeeMnemonic`, `signerMnemonic1..4`)

   `config_test.ts` is gitignored (`.gitignore:10`).

2. Install dependencies:

   ```
   npm ci
   ```

---

## §1 Mnemonic signing

**Coverage:** `test/integration/**` — 39 test files spanning bank, staking, gov, distribution, authz, feegrant, nft, token, cw20, cw721, cw_bridge, cw_marketplace, ibc, mint, slashing, util, chain, gas_estimate, ipfs, contract, arbitrary_sign.

**Run:**

```
npm run test:integration
```

**Pass criteria:** all suites green.

---

## §2 Ledger signing

**Coverage:** `test/ledger/**` — 12 files (`00.bank`, `01.authz`, `02.contract`, `03.cosmwasm`, `04.distribution`, `05.feegrant`, `06.gov`, `07.ibc`, `08.nft`, `09.staking`, `10.token`, `dapp_station`).

**Prerequisites:**

- Physical Ledger device with the FirmaChain app installed and open
- Connected via USB
- See per-file headers (e.g. `test/ledger/dapp_station.test.ts:13`) for any test-specific setup

**Run:**

```
npm run test:ledger
```

Each tx prompts for approval on the device. Confirm every screen.

**Optional debug flags** (`sdk/firmachain/common/LedgerWallet.ts:31-46`):

- `DEBUG_LEDGER=1` — structural tracing (typeUrl, field names). Safe to share.
- `DEBUG_LEDGER_CBOR=1` — full tx dump including rendered amounts/memos and CBOR hex. **Do NOT enable on shared hosts.**

**Known skips:**

- CosmWasm `MsgInstantiateContract` / `MsgExecuteContract` cases with large CW20/CW721 binaries are skipped due to the Zondax device buffer limit (commit `83cc4ab`).

**Pass criteria:** every test returns `code: 0` (or explicit `this.skip()` per the file header).

---

## §3 Station Mobile (QR-scan signing)

End-to-end verification that firma-js builds unsigned txs that Station Mobile can sign via QR scan, and broadcasts the returned signed tx successfully.

firma-js itself does not encode/decode the QR payload — that is owned by the dApp + Station Mobile. The SDK's responsibility is (a) producing the unsigned tx the mobile signs, and (b) broadcasting the signed result.

**Prerequisites:**

- Station Mobile installed and logged in to the same account funded for testing
- A sample dApp (or test harness script) that can:
  1. Build an unsigned tx with `FirmaSDK` / `FirmaMobileSDK`
  2. Encode it as a QR payload per the Station Mobile protocol
  3. Receive the signed tx back and pass it to firma-js for broadcast

**Tx list** — mirrors `test/ledger/dapp_station.test.ts`:

| #  | Module       | Tx                                                                |
|----|--------------|-------------------------------------------------------------------|
| 1  | bank         | `send`                                                            |
| 2  | authz        | `grantStakeAuthorization` (DELEGATE)                              |
| 3  | distribution | `withdrawAllRewards` (single validator)                           |
| 4  | distribution | `withdrawAllRewardsFromAllValidator`                              |
| 5  | gov          | `submitTextProposal`                                              |
| 6  | gov          | `submitCommunityPoolSpendProposal`                                |
| 7  | gov          | `submitStakingParamsUpdateProposal`                               |
| 8  | gov          | `submitGovParamsUpdateProposal`                                   |
| 9  | gov          | `submitSoftwareUpgradeProposal`                                   |
| 10 | gov          | `submitTextProposal` + `cancelProposal`                           |
| 11 | gov          | `vote` — YES → NO → ABSTAIN → NO_WITH_VETO on one proposal        |
| 12 | staking      | `delegate`                                                        |
| 13 | staking      | `undelegate`                                                      |
| 14 | staking      | `redelegate`                                                      |

**Procedure (per row):**

1. Build the unsigned tx via firma-js.
2. Display the QR; scan with Station Mobile.
3. Approve on the phone.
4. Hand the signed tx back to firma-js and broadcast.
5. Confirm chain returns `code: 0`.

**Pass criteria:** all 14 rows succeed with `code: 0`.

---

## Release verification checklist

Before tagging a release, run all three sections in order and record the result in the release notes:

- [ ] §1 Mnemonic — `npm run test:integration` green
- [ ] §2 Ledger — `npm run test:ledger` green (note any expected skips)
- [ ] §3 Station Mobile — all 14 tx rows return `code: 0`
