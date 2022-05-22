/**
 * An implementation of a **dense total order** abstract data type.
 *
 * Here we use "dense total order" to mean:
 * - A [total order](https://en.wikipedia.org/wiki/Total_order),
 * - which is [dense](https://en.wikipedia.org/wiki/Dense_order),
 * - and for which all created elements (we call them **positions**)
 * are unique, even if multiple replicas in a distributed
 * system create positions concurrently.
 *
 * Typically you enforce uniqueness by assigning each replica
 * a unique `replicaID`, then having each replica only
 * generate positions that include a pair `(replicaID, counter)`,
 * where `counter` is a local counter for positions generated
 * by that `replicaID`. (Pairs of this form are sometimes
 * called **causal dots**.)
 *
 * @type P The type of positions (total order elements).
 * For compatibility with [[createBetween]], must not include
 * undefined.
 */
export interface DenseTotalOrder<P> {
  /**
   * Usual compare function for sorts: returns negative if a < b in the total order,
   * positive if a > b.
   */
  compare(a: P, b: P): number;

  /**
   * Returns a globally unique new position c such that a < c < b.
   * Use undefined to indicate start/end of the list.
   *
   * It is permitted for a and b to not be neighbors among
   * the positions generated so far, i.e., there may be
   * positions in between a and b. In that case, the new
   * position c is sorted arbitrarily relative to those
   * "missing" positions. Usually, you will only skip
   * in-between positions like this if they have been
   * deleted from whatever list/etc. you are using these for.
   */
  createBetween(a: P | undefined, b: P | undefined): P;
}
