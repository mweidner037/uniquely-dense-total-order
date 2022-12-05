# Uniquely Dense Total Orders

Interface and implementations for a **uniquely dense total order** abstract data type. This is a concept similar to fractional indexing, but resilient to concurrent insertions. A uniquely dense total order can be used as the core of a list/text CRDT.

This repo is a companion to the blog post [Plain Tree: A Basic List CRDT](https://mattweidner.com/2022/10/21/basic-list-crdt.html), which gives more info about the `UniquelyDenseTotalOrder` interface and the `PlainTree` implementations.

**Caution**: I have only minimally tested the implementations.

## Docs

Open [typedoc/index.html](typedoc/index.html).
