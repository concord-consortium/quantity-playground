import { replaceInputNames } from "./mathjs-utils";

describe("mathjs-utils", () => {
  describe("replaceInputNames", () => {
    it("replaces backtick variables", () => {
      const result = replaceInputNames("`var`", ["var"]);
      expect(result).toBe("input_0");
    });

    it("replaces backtick variables with multiple inputs", () => {
      const result = replaceInputNames("`var`", ["foo", "var"]);
      expect(result).toBe("input_1");
    });

    it("replaces names without backticks", () => {
      const result = replaceInputNames("var", ["var"]);
      expect(result).toBe("input_0");
    });

    it("replaces names without backticks and mutltiple inputs", () => {
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
