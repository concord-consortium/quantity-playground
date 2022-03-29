import { evaluate, unit } from "../custom-mathjs";

describe("MathJS", () => {
  it("can handle unit conversion with evaluate and unit values", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(100, "cm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(2, "m"));
    expect(result.toString()).toEqual("2 m");
  });

  it("converts to the first unit", () => {
    const scope = {
      a: unit(100, "cm"),
      b: unit(1, "m")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(200, "cm"));
    expect(result.toString()).toEqual("200 cm");
  });

  it("can't handle unit conversion with evaluate and valueless units", () => {
    const scope = {
      a: unit("m"),
      b: unit("cm")
    };
    expect(() => evaluate("a+b", scope)).toThrowError();
  });

  it("automatically simplifies units with some functions and not with others", () => {
    const scope = {
      a: unit(1, "m/s"),
      b: unit(1, "s")
    };
    const result = evaluate("a*b", scope);
    expect(result.toString()).toEqual("1 m");
    expect(result.format({})).toEqual("1 m");
    expect(result.toJSON().unit).toEqual("(m s) / s");
    expect(result.formatUnits()).toEqual("(m s) / s");
  });

  it("simplifies units when simplify is called", () => {
    const scope = {
      a: unit(1, "m/s"),
      b: unit(1, "s")
    };
    const result = evaluate("a*b", scope);
    const simp = result.simplify();
    expect(simp.toString()).toEqual("1 m");
    expect(simp.toJSON().unit).toEqual("m");
    expect(simp.formatUnits()).toEqual("m");
  });

  it("does not automatically simplify when the unit is directly constructed", () => {
    const result = unit(1, "(m s) / s");
    expect(result.toString()).toEqual("1 (m s) / s");
    expect(result.format({})).toEqual("1 (m s) / s");
    expect(result.toJSON().unit).toEqual("(m s) / s");
    expect(result.formatUnits()).toEqual("(m s) / s");
  });

  it("returns a Unit when the units cancel on manually created unit", () => {
    const result = unit(1, "m / m");
    const simp = result.simplify();
    expect(simp.toString()).toEqual("1");
    expect(simp.format({})).toEqual("1");
    expect(simp.toJSON().unit).toEqual("");
    expect(simp.formatUnits()).toEqual("");
  });

  it("returns a number the units cancel in an expression", () => {
    const scope = {
      a: unit(1, "s"),
      b: unit(1, "s")
    };
    const result = evaluate("a/b", scope);
    expect(result).toEqual(1);
  });

  it("does not automatically adjusts unit prefix", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(1, "cm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(1.01, "m"));
    expect(result.toString()).toEqual("1.01 m");
  });

  it("does not automatically adjusts unit prefix in powers of 3", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(1, "mm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(1.001, "m"));
    expect(result.toString()).toEqual("1.001 m");
  });

  it("automatically adjusts unit prefix with simplify", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(100, "cm")
    };
    const result = evaluate("a+b", scope);
    const simpl = result.simplify();
    expect(simpl).toEqual(unit(200, "cm"));
    expect(simpl.toString()).toEqual("200 cm");
  });

  it("throws predictable exceptions with incompatible units", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(1, "s")
    };
    expect(() => evaluate("a+b", scope)).toThrowError("Units do not match");
    expect(() => evaluate("a-b", scope)).toThrowError("Units do not match");
  });
});
