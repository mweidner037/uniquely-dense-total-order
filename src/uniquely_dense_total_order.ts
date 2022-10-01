/**
 * Helper interface for sorting and creating unique immutable positions,
 * suitable for use in a List CRDT.
 *
 * @typeParam P The type of positions. Treated as immutable.
 */
export interface UniquelyDenseTotalOrder<P> {
  /**
   * Usual compare function for sorts: returns negative if a < b in
   * their sort order, positive if a > b.
   */
  compare(a: P, b: P): number;

  /**
   * Returns a globally unique new position c such that a < c < b.
   *
   * "Globally unique" means that the created position must be distinct
   * from all other created positions, including ones created concurrently
   * by other users.
   *
   * When a is undefined, it is treated as the start of the list, i.e.,
   * this returns c such that c < b. Likewise, undefined b is treated
   * as the end of the list.
   */
  createBetween(a: P | undefined, b: P | undefined): P;
}
