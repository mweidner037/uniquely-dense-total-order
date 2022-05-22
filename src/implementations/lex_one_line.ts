import { LexDenseTotalOrder } from "../lex_dense_total_order";

/**
 * A "one line" implementation of [[LexDenseTotalOrder]].
 * Its positions are the same as those of [[LexSimple]]
 * except that they all start with an extra "R".
 *
 * This implementation is just for code golf; [[LexSimple]]
 * has clearer code and 1-character-shorter positions.
 */
export class LexOneLine extends LexDenseTotalOrder {
  static readonly FIRST = "R";
  static readonly LAST = "Z";

  private c: number;

  /**
   * @param id A unique ID for the current replica.
   * All id's must have the same length.
   * @param saveData If id was reused from a previous
   * session, then this must equal the value of that session's
   * ending [[save]]`()`.
   */
  constructor(readonly id: string, saveData?: number) {
    super();

    this.c = saveData ?? 0;
  }

  createBetween(
    a: string = LexOneLine.FIRST,
    b: string = LexOneLine.LAST
  ): string {
    return (
      // This is the "one line" that does all of the work.
      // If you want even shorter, you can leave off the counter,
      // although that causes inconveniences (cannot undelete
      // deleted positions; interleaving anomalies).
      (b.startsWith(a) ? b.slice(0, -1) + "L" : a) + `${this.id}${this.c++}R`
    );
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
    return this.c;
  }
}
