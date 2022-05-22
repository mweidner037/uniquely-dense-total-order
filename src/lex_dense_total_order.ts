import { DenseTotalOrder } from "./dense_total_order";

/**
 * A [[DenseTotalOrder]] that sorts using the lexicographic
 * order on strings.
 *
 * This is useful in contexts where you can't specify a
 * custom [[compare]] function for sorts (e.g., a column
 * in a database table). However, it comes at the cost
 * of super-constant size positions (both on the network
 * and in memory).
 */
export abstract class LexDenseTotalOrder implements DenseTotalOrder<string> {
  compare(a: string, b: string): number {
    return a < b ? -1 : a === b ? 0 : 1;
  }

  abstract createBetween(a: string | undefined, b: string | undefined): string;
}
