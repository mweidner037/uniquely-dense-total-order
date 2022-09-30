import { GroupFactory } from "./utils";
import { pseudoRandomReplicaID } from "../src/utils";
import {
  GolfStringPlainTree,
  OptStringPlainTree,
  StringPlainTree,
} from "../src/implementations";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  GolfStringPlainTree: () => (rng) =>
    new GolfStringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
  OptStringPlainTree: () => (rng) =>
    new OptStringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
  LStringPlainTree: () => (rng) =>
    new StringPlainTree({ replicaID: pseudoRandomReplicaID(rng) }),
} as const;
