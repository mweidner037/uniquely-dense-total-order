import { GroupFactory } from "./utils";
import { pseudoRandomReplicaID } from "../src/utils";
import { LexOneLine } from "../src/implementations/lex_one_line";
import { LexOptimized } from "../src/implementations/lex_optimized";
import { LexSimple } from "../src/implementations/lex_simple";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  LexOneLine: () => (rng) => new LexOneLine(pseudoRandomReplicaID(rng)),
  LexOptimized: () => (rng) => new LexOptimized(pseudoRandomReplicaID(rng)),
  LexSimple: () => (rng) => new LexSimple(pseudoRandomReplicaID(rng)),
} as const;
