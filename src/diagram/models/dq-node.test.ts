import { DQNode } from "./dq-node";

describe("DQNode", () => {
  it("can be instantiated with undefined value", () => {
    const node = DQNode.create({ x: 0, y: 0 });
    // but null is converted to undefined automatically via import
    expect(node.value).toBeUndefined();
  });
  it("can't be instantiated with null value but can import null values", () => {
    // @ts-expect-error null value on create results in TypeScript error
    const node = DQNode.create({ value: null, x: 0, y: 0 });
    // but null is converted to undefined automatically via import
    expect(node.value).toBeUndefined();
  });
});
