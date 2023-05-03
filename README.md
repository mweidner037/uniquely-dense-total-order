# Uniquely Dense Total Orders

Interface and implementations for a **uniquely dense total order** abstract data type. This is a concept similar to fractional indexing, but resilient to concurrent insertions. A uniquely dense total order can be used as the core of a list/text CRDT.

This repo is a companion to the blog post [Fugue: A Basic List CRDT](https://mattweidner.com/2022/10/21/basic-list-crdt.html), which gives more info about the `UniquelyDenseTotalOrder` interface and the `Fugue` implementations.

**Caution**: I have only minimally tested the implementations.

For published versions of these implementations, see:

- Tree-based: the [Collabs library's](https://collabs.readthedocs.io/en/latest/) list CRDTs ([CValueList](https://collabs.readthedocs.io/en/latest/api/collabs/classes/CValueList.html), [CText](https://collabs.readthedocs.io/en/latest/api/collabs/classes/CText.html), [CList](https://collabs.readthedocs.io/en/latest/api/collabs/classes/CList.html), [CRichText](https://collabs.readthedocs.io/en/latest/api/collabs/classes/CRichText.html)).
- String-based: [position-strings](https://www.npmjs.com/package/position-strings) npm package.

## Docs

Open [typedoc/index.html](typedoc/index.html).
