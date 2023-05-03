import { UniquelyDenseTotalOrder } from "../uniquely_dense_total_order";
import { randomReplicaID } from "../utils";

export interface TreePosition {
  sender: string;
  counter: number;
}

interface InternalPosition {
  sender: string;
  counter: number;
  /** Root is null */
  parent: InternalPosition | null;
  /** true for left child, false for right child. */
  leftChild: boolean;
  /** Root is 0, so this is >= 1. */
  depth: number;
}

interface NewPositionMessage {
  sender: string;
  counter: number;
  parent: TreePosition | null;
  leftChild: boolean;
}

/**
 * A simple [[UniquelyDenseTotalOrder]] implementing the Fugue algorithm.
 *
 * For a description of the algorithm, see
 * [https://mattweidner.com/2022/10/05/basic-list-crdt.html#tree-implementation](https://mattweidner.com/2022/10/05/basic-list-crdt.html#tree-implementation)
 */
export class TreeFugue implements UniquelyDenseTotalOrder<TreePosition> {
  /**
   * Local replica ID, set in constructor.
   */
  readonly replicaID: string;

  /**
   * The tree of all known (created or [[receive]]d) positions, represented
   * as a collection of [[InternalPosition]]s. Specifically, this collection
   * maps sender, then counter, to the corresponding [[InternalPosition]].
   * For each position, there is a unique InternalPosition object, so they are
   * safe to compare by-reference.
   */
  private readonly state = new Map<string, InternalPosition[]>();

  /**
   * @param send When called, sends message to all other replica's [[receive]]
   * functions, at-least-once in causal order. Also, if send is called
   * during a [[createBetween]] call, then other replicas must
   * [[receive]] the message before using the created position
   * (i.e., passing it to [[compare]] or [[createBetween]]).
   * @param options.replicaID A unique replicaID. Must be unique among all
   * collaborating replicas, including past or concurrent replicas for the
   * same device or user.
   */
  constructor(
    private readonly send: (message: string) => void,
    options: { replicaID?: string } = {}
  ) {
    this.replicaID = options.replicaID ?? randomReplicaID();
    this.state.set(this.replicaID, []);
  }

  /**
   * Returns the [[InternalPosition]] corresponding to pos.
   *
   * Throws an error if pos is not known.
   */
  private getInternalPos(pos: TreePosition): InternalPosition {
    const ans = this.state.get(pos.sender)?.[pos.counter];
    if (ans === undefined) {
      throw new Error("Unknown position: " + JSON.stringify(pos));
    }
    return ans;
  }

  compare(a: TreePosition, b: TreePosition): number {
    let aAnc = this.getInternalPos(a);
    let bAnc = this.getInternalPos(b);
    // Compare a and b in the tree walk.
    // 0. Shortcut: equal case.
    if (a === b) return 0;
    // 1. Walk one up the tree until they are the same depth.
    let lastMove: ["a" | "b", boolean] | null = null;
    while (aAnc.depth > bAnc.depth) {
      lastMove = ["a", aAnc.leftChild];
      aAnc = aAnc.parent!;
    }
    while (bAnc.depth > aAnc.depth) {
      lastMove = ["b", bAnc.leftChild];
      bAnc = bAnc.parent!;
    }
    // 2. If one is an ancestor of the other, short by the descendant's
    // next side (L or R).
    if (aAnc === bAnc) {
      // lastMove is [which is the descendant, true if it's a left descendant].
      return (lastMove![0] === "a" ? 1 : -1) * (lastMove![1] ? -1 : 1);
    }
    // 3. Walk both up the tree until they have a common parent.
    while (aAnc.parent !== bAnc.parent) {
      aAnc = aAnc.parent!;
      bAnc = bAnc.parent!;
    }
    // 4. Compare as siblings: order first by side, then sender, then counter.
    if (aAnc.leftChild && !bAnc.leftChild) return -1;
    else if (!aAnc.leftChild && bAnc.leftChild) return 1;
    else {
      if (aAnc.sender < bAnc.sender) return -1;
      else if (aAnc.sender > bAnc.sender) return 1;
      else return aAnc.counter - bAnc.counter;
    }
  }

  createBetween(
    a: TreePosition | undefined,
    b: TreePosition | undefined
  ): TreePosition {
    // Determine where to place newPos in the tree, following Fugue alg:
    // - If a is *not* an ancestor of b, newPos is a right child of a.
    // - Else, newPos is a left child of b.
    let isAnc = false;
    if (b !== undefined) {
      if (a === undefined) isAnc = true;
      else {
        const aInt = this.getInternalPos(a);
        const bInt = this.getInternalPos(b);
        if (bInt.depth > aInt.depth) {
          let bAnc = bInt;
          while (bAnc.depth > aInt.depth) {
            bAnc = bAnc.parent!;
          }
          if (bAnc === aInt) isAnc = true;
        }
      }
    }
    // A globally unique new position, in the form of a causal dot.
    const newPos = {
      sender: this.replicaID,
      counter: this.state.get(this.replicaID)!.length,
    };
    let newIntPos: InternalPosition;
    if (isAnc) {
      // Left child of b.
      if (b === undefined) {
        newIntPos = { ...newPos, parent: null, leftChild: true, depth: 1 };
      } else {
        const bInt = this.getInternalPos(b);
        newIntPos = {
          ...newPos,
          parent: bInt,
          leftChild: true,
          depth: bInt.depth + 1,
        };
      }
    } else {
      // Right child of a.
      if (a === undefined) {
        newIntPos = { ...newPos, parent: null, leftChild: false, depth: 1 };
      } else {
        const aInt = this.getInternalPos(a);
        newIntPos = {
          ...newPos,
          parent: aInt,
          leftChild: false,
          depth: aInt.depth + 1,
        };
      }
    }

    // Store locally.
    this.state.get(this.replicaID)!.push(newIntPos);

    // Broadcast metadata about newPos.
    const message = {
      ...newPos,
      parent:
        newIntPos.parent === null
          ? null
          : {
              sender: newIntPos.parent.sender,
              counter: newIntPos.parent.counter,
            },
      leftChild: newIntPos.leftChild,
    };
    this.send(JSON.stringify(message));

    return newPos;
  }

  /**
   * See the description of the constructor's `send` argument.
   */
  receive(message: string): void {
    const decoded = <NewPositionMessage>JSON.parse(message);
    let bySender = this.state.get(decoded.sender);
    if (bySender === undefined) {
      bySender = [];
      this.state.set(decoded.sender, bySender);
    }
    // Ignore duplicates (at-least-once delivery).
    if (decoded.counter < bySender.length) return;
    // Require causal order.
    if (decoded.counter > bySender.length) {
      throw new Error(
        'Message delivered out of causal order: "' + message + '"'
      );
    }
    // Good case.
    const parentInt =
      decoded.parent === null ? null : this.getInternalPos(decoded.parent);
    bySender.push({
      sender: decoded.sender,
      counter: decoded.counter,
      parent: parentInt,
      leftChild: decoded.leftChild,
      depth: (parentInt?.depth ?? 0) + 1,
    });
  }
}
