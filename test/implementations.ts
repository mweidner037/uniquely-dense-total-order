import { GroupFactory } from "./utils";
import { pseudoRandomReplicaID } from "../src/utils";
import { StringOneLine } from "../src/implementations/string_one_line";
import { StringOptimized } from "../src/implementations/string_optimized";
import { StringSimple } from "../src/implementations/string_simple";

export const IMPLEMENTATIONS: { [name: string]: GroupFactory<unknown> } = {
  StringOneLine: () => (rng) => new StringOneLine(pseudoRandomReplicaID(rng)),
  StringOptimized: () => (rng) =>
    new StringOptimized(pseudoRandomReplicaID(rng)),
  StringSimple: () => (rng) => new StringSimple(pseudoRandomReplicaID(rng)),
} as const;
