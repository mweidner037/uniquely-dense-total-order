import { LexUDTotalOrder } from "../lex_ud_total_order";
import { randomReplicaID } from "../utils";

/**
 * An optimized version of [[StringPlainTree]].
 *
 * For a description of the algorithm, see
 * [https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation](https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation)
 *
 * The difference from [[StringPlainTree]] (the linked algorithm)
 * is a common-case optimization: left-to-right insertions
 * by the same replica reuse the same (replicaID, counter)
 * pair (we call this a _waypoint_), just using
 * an extra _valueIndex_ to distinguish positions
 * within the sequence, instead of creating a long
 * rightward path in the tree. In this way,
 * a sequence of m left-to-right insertions see their
 * positions grow by O(log(m)) length (the size of
 * valueIndex) instead of O(m) length (the size of
 * a path containing one node per insertion).
 *
 * In more detail, the underlying tree consists of alternating
 * layers:
 * - Nodes in even layers (starting with the root's children)
 * are __waypoints__, each labeled by a pair (replicaID, counter). A waypoint can be either a left or right
 * child of its parent, except that the root only has right
 * children. Waypoint same-siblings siblings are sorted the
 * same as nodes in [[LexSimpleTotalOrder]].
 * - Nodes in odd layers are __value indices__, each labelled
 * by a nonnegative integer. A value index is always a right
 * child of its parent. Value indices are sorted
 * *lexicographically*; we use a subset of numbers for which
 * this coincides with the usual order by magnitude.
 *
 * Each position corresponds to a value index node in the tree
 * whose parent waypoint's replicaID equals the position's
 * creator. A position is a string description of the path
 * from the root to its node (excluding the root).
 * Each pair of nodes (waypoint = (replicaID, counter), valueIndex)
 * is represented by the substring (here written like a template literal):
 * ```
 * ${replicaID},${counter},${valueIndex}${L or R}
 * ```
 * where the final value is L if the next node is a left
 * child, else R (including if this pair is the final node pair
 * to ensure that a terminal node is sorted in between its
 * left and right children).
 */
export class OptStringPlainTree extends LexUDTotalOrder {
  /**
   * Local replica ID, set in constructor.
   * All replicaIDs have the same length.
   */
  readonly replicaID: string;
  /**
   * Maps counter to the most recently used
   * valueIndex for the waypoint (this.replicaID, counter).
   */
  private lastValueIndices: number[] = [];

  /**
   * @param options.replicaID A unique replicaID. Must be unique among all
   * collaborating replicas, including past or concurrent replicas for the
   * same device or user. All collaborating replicas' replicaIDs must be the
   * same length.
   */
  constructor(options: { replicaID?: string } = {}) {
    super();
    this.replicaID = options.replicaID ?? randomReplicaID();
  }

  createBetween(a: string | undefined, b: string | undefined): string {
    if (b !== undefined && (a === undefined || b.startsWith(a))) {
      // Left child of b.
      return b.slice(0, -1) + "L" + this.newWaypointNode();
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
          const leafValueIndex = Number.parseInt(a.slice(lastComma + 1, -1));
          if (this.lastValueIndices[leafCounter] === leafValueIndex) {
            // Success; reuse a's leaf waypoint.
            const valueIndex = lexSucc(leafValueIndex);
            this.lastValueIndices[leafCounter] = valueIndex;
            return a.slice(0, lastComma + 1) + valueIndex.toString() + "R";
          }
        }
        // Failure; cannot reuse a's leaf waypoint.
        return a + this.newWaypointNode();
      }
    }
  }

  /**
   * Returns a node corresponding to a new waypoint, also
   * updating this.lastValueIndices accordingly.
   */
  private newWaypointNode(): string {
    const counter = this.lastValueIndices.length;
    this.lastValueIndices.push(0);
    return `${this.replicaID},${counter},0R`;
  }
}

/**
 * Returns the successor of n in an enumeration of a special
 * set of numbers.
 *
 * That enumeration has the following properties:
 * 1. Each number is a nonnegative integer (however, not all
 * nonnegative integers are enumerated).
 * 2. The number's decimal representations are enumerated in
 * lexicographic order, with no prefixes (i.e., no decimal
 * representation is a prefix of another).
 * 3. The n-th enumerated number has O(log(n)) decimal digits.
 *
 * Properties (2) and (3) are analogous to normal counting,
 * with the usual order by magnitude; the novelty here is that
 * we instead use the lexicographic order on decimal representations.
 * It is also the case that
 * the numbers are in order by magnitude, although we do not
 * use this property.
 *
 * The specific enumeration is:
 * - Start with 0.
 * - Enumerate 9^0 numbers (i.e., just 0).
 * - Add 1, multiply by 10, then enumerate 9^1 numbers (i.e.,
 * 10, 11, ..., 18).
 * - Add 1, multiply by 10, then enumerate 9^2 numbers (i.e.,
 * 190, 191, ..., 270).
 * - Repeat this pattern indefinitely, enumerating
 * 9^(d-1) d-digit numbers for each d >= 1.
 */
function lexSucc(n: number): number {
  const d = n === 0 ? 1 : Math.floor(Math.log10(n)) + 1;
  if (n === Math.pow(10, d) - Math.pow(9, d) - 1) {
    // n -> (n + 1) * 10
    return (n + 1) * 10;
  } else {
    // n -> n + 1
    return n + 1;
  }
}
