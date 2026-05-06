/**
 * Ledger CosmWasm Tx Test
 *
 * Intentionally empty.
 *
 * CosmWasm flows (StoreCode, InstantiateContract, ExecuteContract, UpdateAdmin,
 * ClearAdmin, MigrateContract) cannot be exercised via Ledger because the
 * Zondax Cosmos app's internal buffer (~0x6988 on sign) cannot hold a wasm
 * binary or the nested CBOR screens those messages produce. Re-introduce the
 * cases here once the device-side limit is lifted.
 */

describe.skip('[03. Ledger CosmWasm Tx Test]', () => {});
