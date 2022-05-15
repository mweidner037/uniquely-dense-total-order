import { StringDenseTotalOrder } from "../string_dense_total_order";

function lexInc(str: string): string {
  const n = Number.parseInt(str);
  const d = str.length;
  if (n === Math.pow(10, d) - Math.pow(9, d) - 1) {
    return `${n + 1}0`;
  } else return `${n + 1}`;
}

/**
 * TODO: Note that positions that would be the same in
 * StringSimple, are sorted haphazardly here (lexicographic
 * sort on numbers). Unless we switch to using lexInc for
 * those too.
 *
 * TODO: need to persist valueIndices iff replicaID is persisted.
 *
 * TODO: node format: `${replicaID},${counter},${valueIndex}${R or L}`,
 * leaf nodes always end in R.
 * This time, counters are sorted lexicographically with
 * normal prefix rule, since ',' comes before digits.
 * Meanwhile, valueIndices are never prefixes of each other.
 */
export class StringOptimized extends StringDenseTotalOrder {
  /**
   * Maps each counter to the most recently used
   * valueIndex for the waypoint (this.replicaID, counter).
   */
  private lastValueIndices: string[] = [];

  /**
   * All replicaID's must have the same length.
   */
  constructor(readonly replicaID: string) {
    super();
  }

  createBetween(a: string | undefined, b: string | undefined): string {
    if (b !== undefined && (a === undefined || b.startsWith(a))) {
      // Left child of b.
      return `${b.slice(0, -1)}L${this.newWaypointNode()}`;
    } else {
      // Right child of a.
      if (a === undefined) return this.newWaypointNode();
      else {
        // Check if we can reuse a's leaf waypoint.
        // For this to happen, a's leaf waypoint must have also
        // been sent by us, and its next valueIndex must not
        // have been used already (i.e., the node matches
        // this.lastValueIndices).
        const lastComma = a.lastIndexOf(",");
        const secondLastComma = a.lastIndexOf(",", lastComma);
        const leafSender = a.slice(
          secondLastComma - this.replicaID.length,
          secondLastComma
        );
        if (leafSender === this.replicaID) {
          const leafCounter = Number.parseInt(
            a.slice(secondLastComma + 1, lastComma)
          );
          const leafValueIndex = a.slice(lastComma + 1, -1);
          if (this.lastValueIndices[leafCounter] === leafValueIndex) {
            // Success; reuse a's leaf waypoint.
            const valueIndex = lexInc(leafValueIndex);
            this.lastValueIndices[leafCounter] = valueIndex;
            return `${a.slice(0, lastComma + 1)}${valueIndex}R`;
          }
        }
        // Failure; cannot reuse a's leaf waypoint.
        return `${a}${this.newWaypointNode()}`;
      }
    }
  }

  /**
   * Returns a node corresponding to a new waypoint, also
   * updating this.lastValueIndices accordingly.
   */
  private newWaypointNode(): string {
    const counter = this.lastValueIndices.length;
    this.lastValueIndices.push("0");
    return `${this.replicaID},${counter},0R`;
  }
}
