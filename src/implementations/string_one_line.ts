import { StringDenseTotalOrder } from "../string_dense_total_order";

/**
 * TODO: Note undeletion and interleaving issues
 * (unlike StringSimple).
 *
 */
export class StringOneLine extends StringDenseTotalOrder {
  static readonly FIRST = "R";
  static readonly LAST = "Z";

  /**
   * All replicaID's must have the same length.
   */
  constructor(readonly replicaID: string) {
    super();
  }

  createBetween(
    a: string = StringOneLine.FIRST,
    b: string = StringOneLine.LAST
  ): string {
    return (b.startsWith(a) ? b.slice(0, -1) + "L" : a) + this.replicaID + "R";
  }
}
