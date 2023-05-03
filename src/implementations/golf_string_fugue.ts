import { LexUDTotalOrder } from "../lex_ud_total_order";
import { randomReplicaID } from "../utils";

/**
 * A code golf version of [[StringFugue]].
 *
 * Its positions are the same as those of [[StringFugue]]
 * except that they all start with an extra "R".
 * This implementation is just for code golf; [[StringFugue]]
 * has clearer code and 1-character-shorter positions.
 *
 * For a description of the algorithm, see
 * [https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation](https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation)
 */
export class GolfStringFugue extends LexUDTotalOrder {
  readonly id: string;
  private c = 0;

  /**
   * @param options.replicaID A unique replicaID. Must be unique among all
   * collaborating replicas, including past or concurrent replicas for the
   * same device or user. All collaborating replicas' replicaIDs must be the
   * same length.
   */
  constructor(options: { replicaID?: string } = {}) {
    super();
    this.id = options.replicaID ?? randomReplicaID();
  }

  createBetween(a = "R", b = "Z"): string {
    return (
      // "One line" List CRDT :)
      (b.startsWith(a) ? b.slice(0, -1) + "L" : a) + `${this.id}${this.c++}R`
    );
  }

  // ...
}
