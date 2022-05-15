/**
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
   * Returns a globally unique new position P such that a < P < b.
   * Use undefined to indicate start/end of the list.
   */
  createBetween(a: P | undefined, b: P | undefined): P;
}
