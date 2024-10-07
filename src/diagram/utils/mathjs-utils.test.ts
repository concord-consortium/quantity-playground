import { createMath } from "../custom-mathjs";
import { UnitsManager } from "../units-manager";
import {replaceInputNames, getUsedInputs} from "./mathjs-utils";

describe("mathjs-utils", () => {
  const unitsManager = new UnitsManager();
  const math = createMath(unitsManager);
  describe("getMathUnit", () => {
    it("get standard unit", () => {
      const result = unitsManager.getMathUnit(0,"mm", math);
      expect(result?.toString()).toBe("0 mm");
    });
    it("get custom unit", () => {
      const result = unitsManager.getMathUnit(0, "cat", math);
      expect(result?.toString()).toBe("0 cat");
    });
    it("plural of existing custom unit is same", () => {
      const singU = unitsManager.getMathUnit(0, "mouse", math);
      const plurU = unitsManager.getMathUnit(0, "mice", math);
      expect(singU && plurU?.equals(singU)).toBe(true);
    });
    it("plural of unit can be named first", () => {
      const plurU = unitsManager.getMathUnit(0, "halves", math);
      const singU = unitsManager.getMathUnit(0, "half", math);
      expect(singU && plurU?.equals(singU)).toBe(true);
    });
    it("new unit with singular that is already a unit doesn't crash", () => {
      expect(unitsManager.getMathUnit(0, "yds", math)).toBeTruthy();
    });
    it("permits the '$' unit", () => {
      const u = unitsManager.getMathUnit(0,"$",math);
      expect(u?.toString()).toBe("0 $");
    });
    it("doesn't permit the '*' unit", () => {
      const u = unitsManager.getMathUnit(0,"*",math);
      expect(u).toBe(undefined);
    });
    it("can create multiple units from an expression", () => {
      const u = unitsManager.getMathUnit(0,"$/year",math);
      expect(u?.toString()).toBe("0 $ / year");
    });
  });
  describe("replaceInputNames", () => {
    it("replaces names used in expression", () => {
      const result = replaceInputNames("var", ["var"], math);
      expect(result).toBe("input_0");
    });

    it("replaces names used in expression when there are multiple inputs", () => {
      const result = replaceInputNames("var", ["foo", "var"], math);
      expect(result).toBe("input_1");
    });

    it("replaces names in complex expressions", () => {
      const inputs = ["foo", "var"];

      expect(replaceInputNames("var/1",inputs,math)).toBe("input_1 / 1");
      expect(replaceInputNames("2var",inputs,math)).toBe("2 input_1");
      expect(replaceInputNames("var^2",inputs,math)).toBe("input_1 ^ 2");
      expect(replaceInputNames("varA * var",inputs,math)).toBe("varA * input_1");
      expect(replaceInputNames("var2 * var",inputs,math)).toBe("var2 * input_1");
      expect(replaceInputNames("var 2 * var",inputs,math)).toBe("input_1 2 * input_1");
      expect(replaceInputNames("var-foo",inputs,math)).toBe("input_1 - input_0");
      expect(replaceInputNames("-var",inputs,math)).toBe("-input_1");
    });
  });
  describe("getUsedInputs", () => {
    it("returns the names of available input variables used in a valid expression", () => {
      const result = getUsedInputs("var1+var2", ["var1", "var2", "var3"], math);
      expect(result).toStrictEqual(["var1", "var2"]);
    });
    it("returns the names of available input variables used in an invalid expression", () => {
      const result = getUsedInputs("var1+var2+", ["var1", "var2", "var3"], math);
      expect(result).toStrictEqual(["var1", "var2"]);
    });
  });
});
