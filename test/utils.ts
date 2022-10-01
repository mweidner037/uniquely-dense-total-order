import { assert } from "chai";
import seedrandom from "seedrandom";
import { UniquelyDenseTotalOrder } from "../src/uniquely_dense_total_order";

export type ReplicaFactory<P> = (
  rng: seedrandom.PRNG
) => UniquelyDenseTotalOrder<P>;
export type GroupFactory<P> = () => ReplicaFactory<P>;

export function safeCreateBetween<P>(
  order: UniquelyDenseTotalOrder<P>,
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

export function assertIsOrdered<P>(
  order: UniquelyDenseTotalOrder<P>,
  list: P[]
) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      assert.isBelow(order.compare(list[i], list[j]), 0);
      assert.isAbove(order.compare(list[j], list[i]), 0);
    }
  }
}

export function assertIsOrderedAll<P>(
  orders: UniquelyDenseTotalOrder<P>[],
  list: P[]
) {
  orders.forEach((order) => assertIsOrdered(order, list));
}
