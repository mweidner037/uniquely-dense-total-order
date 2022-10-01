import { GroupFactory } from "./utils";
import { pseudoRandomReplicaID } from "../src/utils";
import {
  GolfStringPlainTree,
  OptStringPlainTree,
  StringPlainTree,
  TreePlainTree,
} from "../src/implementations";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  GolfStringPlainTree: () => (rng) =>
    new GolfStringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
  OptStringPlainTree: () => (rng) =>
    new OptStringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
  StringPlainTree: () => (rng) =>
    new StringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
  TreePlainTree: () => {
    const replicas: TreePlainTree[] = [];
    // send function: immediate in-order broadcast.
    function send(message: string) {
      replicas.forEach((replica) => replica.receive(message));
    }
    return function (rng) {
      const replica = new TreePlainTree(send, {
        replicaID: pseudoRandomReplicaID(rng),
      });
      replicas.push(replica);
      return replica;
    };
  },
} as const;
