import seedrandom from "seedrandom";
import { UniquelyDenseTotalOrder } from "../src/uniquely_dense_total_order";
import { IMPLEMENTATIONS } from "./implementations";
import {
  assertIsOrdered,
  assertIsOrderedAll,
  GroupFactory,
  safeCreateBetween,
} from "./utils";

for (const [name, newGroup] of Object.entries(IMPLEMENTATIONS)) {
  describe(name, () => {
    doManualTests(newGroup);
  });
}

function doManualTests<P>(newGroup: GroupFactory<P>) {
  describe("manual", () => {
    describe("single user", () => {
      let rng: seedrandom.PRNG;
      let alice: UniquelyDenseTotalOrder<P>;

      beforeEach(() => {
        rng = seedrandom("42");
        alice = newGroup()(rng);
      });

      it("LTR", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(alice, last, undefined);
          list.push(last);
        }
        assertIsOrdered(alice, list);
      });

      it("RTL", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(alice, undefined, last);
          list.unshift(last);
        }
        assertIsOrdered(alice, list);
      });

      it("restart", () => {
        const list: P[] = [];
        for (let j = 0; j < 5; j++) {
          let last: P | undefined = undefined;
          let after = j === 0 ? undefined : list[0];
          for (let i = 0; i < 10; i++) {
            last = safeCreateBetween(alice, last, after);
            list.splice(i, 0, last);
          }
        }
        assertIsOrdered(alice, list);
      });
    });

    describe("two users", () => {
      let rng: seedrandom.PRNG;
      let alice: UniquelyDenseTotalOrder<P>;
      let bob: UniquelyDenseTotalOrder<P>;

      beforeEach(() => {
        rng = seedrandom("42");
        const group = newGroup();
        alice = group(rng);
        bob = group(rng);
      });

      it("LTR sequential", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 40; i++) {
          const user = i >= 20 ? bob : alice;
          last = safeCreateBetween(user, last, undefined);
          list.push(last);
        }
        assertIsOrderedAll([alice, bob], list);
      });

      it("LTR alternating", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 40; i++) {
          const user = i % 2 === 0 ? bob : alice;
          last = safeCreateBetween(user, last, undefined);
          list.push(last);
        }
        assertIsOrderedAll([alice, bob], list);
      });

      it("RTL sequential", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 40; i++) {
          const user = i >= 20 ? bob : alice;
          last = safeCreateBetween(user, undefined, last);
          list.unshift(last);
        }
        assertIsOrderedAll([alice, bob], list);
      });

      it("RTL alternating", () => {
        let last: P | undefined = undefined;
        const list: P[] = [];
        for (let i = 0; i < 40; i++) {
          const user = i % 2 === 0 ? bob : alice;
          last = safeCreateBetween(user, undefined, last);
          list.unshift(last);
        }
        assertIsOrderedAll([alice, bob], list);
      });

      it("restart alternating", () => {
        const list: P[] = [];
        for (let j = 0; j < 5; j++) {
          let last: P | undefined = undefined;
          let after = j === 0 ? undefined : list[0];
          for (let i = 0; i < 10; i++) {
            const user = i % 2 === 0 ? bob : alice;
            last = safeCreateBetween(user, last, after);
            list.splice(i, 0, last);
          }
        }
        assertIsOrderedAll([alice, bob], list);
      });

      it("LTR concurrent", () => {
        let last: P | undefined = undefined;
        const list1: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(alice, last, undefined);
          list1.push(last);
        }
        last = undefined;
        const list2: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(bob, last, undefined);
          list2.push(last);
        }
        // list1 and list2 should be sorted one after the other, according
        // to their first element (non-interleaving).
        let list: P[];
        if (alice.compare(list1[0], list2[0]) < 0) {
          // list1 < list2
          list = [...list1, ...list2];
        } else list = [...list2, ...list1];
        assertIsOrderedAll([alice, bob], list);
      });

      it("RTL concurrent", () => {
        let last: P | undefined = undefined;
        const list1: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(alice, undefined, last);
          list1.unshift(last);
        }
        last = undefined;
        const list2: P[] = [];
        for (let i = 0; i < 20; i++) {
          last = safeCreateBetween(bob, undefined, last);
          list2.unshift(last);
        }
        // list1 and list2 should be sorted one after the other, according
        // to their first element (non-interleaving).
        let list: P[];
        if (alice.compare(list1[0], list2[0]) < 0) {
          // list1 < list2
          list = [...list1, ...list2];
        } else list = [...list2, ...list1];
        assertIsOrderedAll([alice, bob], list);
      });

      it("insert between concurrent", () => {
        // "Hard case" from the blog post - see
        // https://mattweidner.com/2022/10/05/basic-list-crdt.html#between-concurrent
        const a = safeCreateBetween(alice, undefined, undefined);
        const b = safeCreateBetween(alice, a, undefined);

        let c = safeCreateBetween(alice, a, b);
        let d = safeCreateBetween(bob, a, b);
        // Order so c < d.
        if (alice.compare(c, d) > 0) [c, d] = [d, c];

        // Try making e on both alice and bob.
        let e1 = safeCreateBetween(alice, c, d);
        let e2 = safeCreateBetween(bob, c, d);

        assertIsOrderedAll([alice, bob], [a, c, e1, d, b]);
        assertIsOrderedAll([alice, bob], [a, c, e2, d, b]);
      });
    });
  });
}
