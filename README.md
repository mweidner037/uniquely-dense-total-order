# Dense Total Order

Interface and implementations for a **dense total order** abstract data type. This is a concept similar to fractional indexing, but resilient to concurrent insertions. A dense total order can be used as the core of a list/text CRDT (see [here](https://mattweidner.com/2022/02/10/collaborative-data-design.html#list-crdt)).

For the definition of a dense total order, view the docs for `DenseTotalOrder` (either build them following the instructions below, or just look at `src/dense_total_order.ts`).

**Caution**: I have only minimally tested these implementations.

## Docs

`npm i`, then `npm run build`, then open `typedoc/index.html`.

The current implementations are all based on a list CRDT called Double RGA, which is described [here](https://docs.google.com/presentation/d/1u8bcvfEcJ2wseH3u4P8QAMabq5VZrPR-FX8VaIIkbFQ/edit?usp=sharing).
