import { LexDenseTotalOrder } from "../lex_dense_total_order";

/**
 * A simple implementation of [[LexDenseTotalOrder]].
 *
 * The underlying dense total order is Double RGA.
 * Nodes in the tree are represented using the path from the
 * root to that node. For each node on that path, we
 * include the substring (here written like a template literal):
 * ```
 * ${node's replicaID}${node's counter}${L or R}
 * ```
 * where the final value is L if the next node is a left
 * child, else R (including if this node is the final node,
 * to ensure that a terminal node is sorted in between its
 * left and right children). The first
 * node is always implicitly a right child of the root, which
 * is omitted.
 *
 * One can check that the lexicographic order on these
 * positions corresponds to the tree order, with the
 * arbitrary sort on sibling nodes given by:
 * - First sort by replicaID.
 * - Then sort by counter, lexicographically, except that
 *  prefixes are greater than suffixes (since counter is
 * always followed by R or L, and those are both greater
 * than all digits).
 */
export class LexSimple extends LexDenseTotalOrder {
  private counter: number;

  /**
   * @param replicaID A unique ID for the current replica.
   * All replicaID's must have the same length.
   * @param saveData If replicaID was reused from a previous
   * session, then this must equal the value of that session's
   * ending [[save]]`()`.
   */
  constructor(readonly replicaID: string, saveData?: number) {
    super();

    this.counter = saveData ?? 0;
  }

  createBetween(a: string | undefined, b: string | undefined): string {
    // Unique new node.
    const newNode = `${this.replicaID}${this.counter++}R`;

    if (b !== undefined && (a === undefined || b.startsWith(a))) {
      // Left child of b.
      return b.slice(0, -1) + "L" + newNode;
    } else {
      // Right child of a.
      return (a ?? "") + newNode;
    }
  }

  /**
   * Returns a nonnegative integer that must be saved and passed to
   * the constructor if [[this.replicaID]] is reused
   * in a later session.
   *
   * Specifically, the return value is the number of
   * times that [[createBetween]] has been called with this
   * [[replicaID]]. Hence it can usually be represented as
   * a uint32.
   */
  save(): number {
    return this.counter;
  }
}
