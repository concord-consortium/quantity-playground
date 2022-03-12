import { DQNode, tryToSimplify } from "./dq-node";

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

describe("tryToSimplify", () => {
  // "÷"|"×"
  it("cancels 'm/s' / 'm/s'", () => {
    const result = tryToSimplify("÷", "m/s", "m/s");
    expect(result.message).toBe("units cancel");
  });

  // `m/s^2` instead of `(1/s)^2*m`
  it("simplifies '(1/s)^2*m' to 'm/s^2'", () => {
    const result = tryToSimplify("×", "(1/s)^2", "m");
    expect(result.unit).toBe("m / s ^ 2");
  });

  it("simplifies '$/piece / peice/day/worker' to '$/day/worker'", () => {
    const result = tryToSimplify("×", "$/piece", "piece/day/worker");
    expect(result.unit).toBe("$ / day / worker");
  });
});