import { castToSnapshot, types } from "mobx-state-tree";
import { DQNode } from "./dq-node";
import { GenericContainer } from "./test-utils";
import { Variable } from "./variable";

describe("DQNode", () => {
  it("can be instantiated with undefined value", () => {
    const variable = Variable.create({});
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });

    // references have to be within the same tree so we need some container 
    const container = GenericContainer.create(
      {items: [castToSnapshot(variable), node]}
    );

    expect(node.variable.value).toBeUndefined();
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // it("can't be instantiated with null value but can import null values", () => {
  //   // @ts-expect-error null value on create results in TypeScript error
  //   const node = DQNode.create({ value: null, x: 0, y: 0 });
  //   // but null is converted to undefined automatically via import
  //   expect(node.value).toBeUndefined();
  // });
});
