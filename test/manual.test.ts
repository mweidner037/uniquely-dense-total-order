import seedrandom from "seedrandom";
import { DenseTotalOrder } from "../src/dense_total_order";
import { assertIsOrdered, GroupFactory, safeCreateBetween } from "./utils";
import { IMPLEMENTATIONS } from "./implementations";

for (const [name, newGroup] of Object.entries(IMPLEMENTATIONS)) {
  describe(name, () => {
    doManualTests(newGroup);
  });
}

function doManualTests<P>(newGroup: GroupFactory<P>) {
  describe("manual", () => {
    describe("single user", () => {
      let rng: seedrandom.PRNG;
      let alice: DenseTotalOrder<P>;

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
  });
}
