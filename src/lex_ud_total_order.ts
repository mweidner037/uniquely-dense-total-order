import { UniquelyDenseTotalOrder } from "./uniquely_dense_total_order";

/**
 * A [[UniquelyDenseTotalOrder]] that sorts using the lexicographic
 * order on strings.
 *
 * This is useful in contexts where you can't specify a
 * custom [[compare]] function for sorts (e.g., a column
 * in a database table). However, it comes at the cost
 * of super-constant size positions (both on the network
 * and in memory).
 */
export abstract class LexUDTotalOrder
  implements UniquelyDenseTotalOrder<string>
{
  compare(a: string, b: string): number {
    return a < b ? -1 : a === b ? 0 : 1;
  }

  abstract createBetween(a: string | undefined, b: string | undefined): string;
}
