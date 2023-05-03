import {
  GolfStringFugue,
  OptStringFugue,
  StringFugue,
  TreeFugue,
} from "../src/implementations";
import { pseudoRandomReplicaID } from "../src/utils";
import { GroupFactory } from "./utils";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  GolfStringFugue: () => (rng) =>
    new GolfStringFugue({ replicaID: pseudoRandomReplicaID(rng) }),
  OptStringFugue: () => (rng) =>
    new OptStringFugue({ replicaID: pseudoRandomReplicaID(rng) }),
  StringFugue: () => (rng) =>
    new StringFugue({ replicaID: pseudoRandomReplicaID(rng) }),
  TreeFugue: () => {
    const replicas: TreeFugue[] = [];
    // send function: immediate in-order broadcast.
    function send(message: string) {
      replicas.forEach((replica) => replica.receive(message));
    }
    return function (rng) {
      const replica = new TreeFugue(send, {
        replicaID: pseudoRandomReplicaID(rng),
      });
      replicas.push(replica);
      return replica;
    };
  },
} as const;
