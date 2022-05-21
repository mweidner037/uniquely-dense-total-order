import { StringDenseTotalOrder } from "../string_dense_total_order";

export class StringOneLine extends StringDenseTotalOrder {
  static readonly FIRST = "R";
  static readonly LAST = "Z";

  private c = 0;

  /**
   * All id's must have the same length.
   */
  constructor(readonly id: string) {
    super();
  }

  createBetween(
    a: string = StringOneLine.FIRST,
    b: string = StringOneLine.LAST
  ): string {
    return (
      (b.startsWith(a) ? b.slice(0, -1) + "L" : a) + `${this.id}${this.c++}R`
    );
  }
}
