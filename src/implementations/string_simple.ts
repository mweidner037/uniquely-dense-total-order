import { StringDenseTotalOrder } from "../string_dense_total_order";

/**
 * TODO: Note that positions that would be the same in
 * StringSimple, are sorted haphazardly here (lexicographic
 * sort on numbers).
 *
 * TODO: need to persist counter iff replicaID is persisted.
 */
export class StringSimple extends StringDenseTotalOrder {
  private counter = 0;

  /**
   * All replicaID's must have the same length.
   */
  constructor(readonly replicaID: string) {
    super();
  }

  createBetween(a: string | undefined, b: string | undefined): string {
    // Unique new node.
    // Order w.r.t. concurrent nodes with the same parent
    // and side:
    // - First sort by replicaID.
    // - Then sort by counter, lexicographically, except that
    // prefixes are greater than suffixes (since counter is
    // always followed by R or L, and those are both greater
    // than all digits).
    const newNode = `${this.replicaID}${this.counter++}R`;

    if (b !== undefined && (a === undefined || b.startsWith(a))) {
      // Left child of b.
      return b.slice(0, -1) + "L" + newNode;
    } else {
      // Right child of a.
      return (a ?? "") + newNode;
    }
  }
}
