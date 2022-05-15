import { DenseTotalOrder } from "./dense_total_order";

export abstract class StringDenseTotalOrder implements DenseTotalOrder<string> {
  compare(a: string, b: string): number {
    return a < b ? -1 : a === b ? 0 : 1;
  }

  abstract createBetween(a: string | undefined, b: string | undefined): string;
}
