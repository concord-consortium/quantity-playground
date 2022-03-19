import { tryToSimplify } from "./unit-simplify";

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