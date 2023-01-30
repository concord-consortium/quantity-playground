import {getMathUnit, replaceInputNames} from "./mathjs-utils";

describe("mathjs-utils", () => {
  describe("getMathUnit", () => {
    it("get standard unit", () => {
      const result = getMathUnit(0,"mm");
      expect(result?.toString()).toBe("0 mm");
    });
    it("get custom unit", () => {
      const result = getMathUnit(0, "cat");
      expect(result?.toString()).toBe("0 cat");
    });
    it("plural of existing custom unit is same", () => {
      const singU = getMathUnit(0, "mouse");
      const plurU = getMathUnit(0, "mice");
      expect(singU && plurU?.equals(singU)).toBe(true);
    });
    it("plural of unit can be named first", () => {
      const plurU = getMathUnit(0, "halves");
      const singU = getMathUnit(0, "half");
      expect(singU && plurU?.equals(singU)).toBe(true);
    });
    it("permits the '$' unit", () => {
      const u = getMathUnit(0,"$");
      expect(u?.toString()).toBe("0 $");
    });
    it("doesn't permit the '*' unit", () => {
      const u = getMathUnit(0,"*");
      expect(u).toBe(undefined);
    });
    it("can create multiple units from an expression", () => {
      const u = getMathUnit(0,"$/year");
      expect(u?.toString()).toBe("0 $ / year");
    });
  });
  describe("replaceInputNames", () => {
    it("replaces names used in expression", () => {
      const result = replaceInputNames("var", ["var"]);
      expect(result).toBe("input_0");
    });

    it("replaces names used in expression when there are multiple inputs", () => {
      const result = replaceInputNames("var", ["foo", "var"]);
      expect(result).toBe("input_1");
    });

    it("replaces names in complex expressions", () => {
      const inputs = ["foo", "var"];

      expect(replaceInputNames("var/1",inputs)).toBe("input_1 / 1");
      expect(replaceInputNames("2var",inputs)).toBe("2 input_1");
      expect(replaceInputNames("var^2",inputs)).toBe("input_1 ^ 2");
      expect(replaceInputNames("varA * var",inputs)).toBe("varA * input_1");
      expect(replaceInputNames("var2 * var",inputs)).toBe("var2 * input_1");
      expect(replaceInputNames("var 2 * var",inputs)).toBe("input_1 2 * input_1");
      expect(replaceInputNames("var-foo",inputs)).toBe("input_1 - input_0");
      expect(replaceInputNames("-var",inputs)).toBe("-input_1");
    });
  });
});
