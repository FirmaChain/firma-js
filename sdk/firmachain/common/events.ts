import { fromUtf8 } from "@cosmjs/encoding";
import { tendermint34, tendermint37 } from "@cosmjs/tendermint-rpc";

/**
 * This file is copied from @cosmjs/stargate.
 * https://github.com/cosmos/cosmjs/blob/v0.34.0/packages/stargate/src/events.ts
 */

/**
 * An event attribute.
 *
 * This is the same attribute type as tendermint34.Attribute and tendermint35.EventAttribute
 * but `key` and `value` are unified to strings. The conversion
 * from bytes to string in the Tendermint 0.34 case should be done by performing
 * [lossy] UTF-8 decoding.
 *
 * [lossy]: https://doc.rust-lang.org/stable/std/string/struct.String.html#method.from_utf8_lossy
 */
export interface Attribute {
  readonly key: string;
  readonly value: string;
}

/**
 * The same event type as tendermint34.Event and tendermint35.Event
 * but attribute keys and values are unified to strings. The conversion
 * from bytes to string in the Tendermint 0.34 case should be done by performing
 * [lossy] UTF-8 decoding.
 *
 * [lossy]: https://doc.rust-lang.org/stable/std/string/struct.String.html#method.from_utf8_lossy
 */
export interface Event {
  readonly type: string;
  readonly attributes: readonly Attribute[];
}

/**
 * Takes a Tendermint 0.34 or 0.37 event with binary encoded key and value
 * and converts it into an `Event` with string attributes.
 */
export function fromTendermintEvent(event: tendermint34.Event | tendermint37.Event): Event {
  return {
    type: event.type,
    attributes: event.attributes.map(
      (attr): Attribute => ({
        key: typeof attr.key == "string" ? attr.key : fromUtf8(attr.key, true),
        value: typeof attr.value == "string" ? attr.value : fromUtf8(attr.value, true),
      }),
    ),
  };
}