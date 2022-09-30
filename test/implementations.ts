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
  TreePlainTree: () => (rng) =>
    new TreePlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
} as const;
