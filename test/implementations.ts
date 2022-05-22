import { GroupFactory } from "./utils";
import { pseudoRandomReplicaID } from "../src/utils";
import { LexOneLine, LexOptimized, LexSimple } from "../src/implementations";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  LexOneLine: () => (rng) => new LexOneLine(pseudoRandomReplicaID(rng)),
  LexOptimized: () => (rng) => new LexOptimized(pseudoRandomReplicaID(rng)),
  LexSimple: () => (rng) => new LexSimple(pseudoRandomReplicaID(rng)),
} as const;
