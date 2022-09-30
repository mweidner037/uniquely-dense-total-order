import { UniquelyDenseTotalOrder } from "../uniquely_dense_total_order";
import { randomReplicaID } from "../utils";

export interface TreePosition {
  sender: string;
  counter: number;
}

/**
 * TODO: revise
 * A simple [[LexUDTotalOrder]] implementing the Plain Tree algorithm.
 *
 * For a description of the algorithm, see
 * [https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation](https://mattweidner.com/2022/10/05/basic-list-crdt.html#intro-string-implementation)
 */
export class TreePlainTree implements UniquelyDenseTotalOrder<TreePosition> {
  /**
   * Local replica ID, set in constructor.
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
    this.replicaID = options.replicaID ?? randomReplicaID();
  }

  compare(a: TreePosition, b: TreePosition): number {
    throw new Error("Method not implemented.");
  }

  createBetween(
    a: TreePosition | undefined,
    b: TreePosition | undefined
  ): TreePosition {
    // A globally unique new position, in the form of a causal dot.
    const newPos = { sender: this.replicaID, counter: this.counter++ };
    // TODO: bcast meta
    return newPos;
  }
}
