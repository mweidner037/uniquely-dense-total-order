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
    });
  });
}
