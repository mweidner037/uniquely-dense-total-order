import { assert } from "chai";
import seedrandom from "seedrandom";
import { DenseTotalOrder } from "../src/dense_total_order";

export type ReplicaFactory<P> = (rng: seedrandom.PRNG) => DenseTotalOrder<P>;
export type GroupFactory<P> = () => ReplicaFactory<P>;

export function safeCreateBetween<P>(
  order: DenseTotalOrder<P>,
  a: P | undefined,
  b: P | undefined
): P {
  if (a !== undefined && b !== undefined) {
    assert.isBelow(order.compare(a, b), 0, `${a}, ${b}`);
    assert.isAbove(order.compare(b, a), 0, `${a}, ${b}`);
  }
  const c = order.createBetween(a, b);
  if (a !== undefined) {
    assert.isBelow(order.compare(a, c), 0, `${a}, ${c}, ${b}`);
    assert.isAbove(order.compare(c, a), 0, `${a}, ${c}, ${b}`);
  }
  if (b !== undefined) {
    assert.isBelow(order.compare(c, b), 0, `${a}, ${c}, ${b}`);
    assert.isAbove(order.compare(b, c), 0, `${a}, ${c}, ${b}`);
  }
  assert.strictEqual(order.compare(c, c), 0, `${a}, ${c}, ${b}`);
  return c;
}

export function assertIsOrdered<P>(order: DenseTotalOrder<P>, list: P[]) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      assert.isBelow(order.compare(list[i], list[j]), 0);
      assert.isAbove(order.compare(list[j], list[i]), 0);
    }
  }
}
