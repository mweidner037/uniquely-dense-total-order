import { LexUDTotalOrder } from "../lex_ud_total_order";
import { randomReplicaID } from "../utils";

/**
 * A simple [[LexUDTotalOrder]] implementing the Plain Tree algorithm.
 *
 * For a description of the algorithm, see
 * [https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation](https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation)
 */
export class StringPlainTree extends LexUDTotalOrder {
  /**
   * Local replica ID, set in constructor.
   * All replicaIDs have the same length.
   */
  readonly replicaID: string;
  // Local counter.
  private counter = 0;

  /**
   * @param options replicaID: A unique replicaID. Must be unique among all
   * collaborating replicas, including past or concurrent replicas for the
   * same device or user. All collaborating replicas' replicaIDs must be the
   * same length.
   */
  constructor(options: { replicaID?: string } = {}) {
    super();
    this.replicaID = options.replicaID ?? randomReplicaID();
  }

  createBetween(a: string | undefined, b: string | undefined): string {
    // A globally unique new string, in the form of a causal dot.
    const uniqueStr = `${this.replicaID}${this.counter++}`;

    if (a !== undefined && b !== undefined) {
      if (!b.startsWith(a)) {
        // a is not a prefix of b.
        return a + uniqueStr + "R";
      } else {
        // a is a strict prefix of b.
        const bWithL = b.slice(0, -1) + "L";
        return bWithL + uniqueStr + "R";
      }
    } else {
      // Edge cases.
      if (b === undefined) {
        // Treat a (possibly undefined) as not a prefix of b.
        return (a ?? "") + uniqueStr + "R";
      } else {
        // Treat a (undefined) as a strict prefix of b.
        const bWithL = b.slice(0, -1) + "L";
        return bWithL + uniqueStr + "R";
      }
    }
  }
}
