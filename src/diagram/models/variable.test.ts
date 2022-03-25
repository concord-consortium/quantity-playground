import { castToReferenceSnapshot } from "mobx-state-tree";
import { GenericContainer } from "./test-utils";
import { Operation, Variable, VariableType } from "./variable";

describe("Variable", () => {
  it("Can be created", () => {
    const variable = Variable.create();

    // It should have an id with a length of 16
    expect(variable.id).toBeDefined();
    expect(variable.id).toHaveLength(16);
  });

  describe("computedValue", () => {
    it("with no inputs, its own value", () => {
      const variable = Variable.create({value: 123.5});
      expect(variable.computedValueIncludingError).toEqual({value: 123.5});
      expect(variable.computedValue).toBe(123.5);

    });

    it("with 1 input it returns the input value, ignoring its own value", () => {
      const container = GenericContainer.create({
        items: [
          {id: "input", value: 999.9},
          {id: "variable", value: 123.5, inputA: "input"}
        ]
      });
      const input = container.items[0] as VariableType;
      const variable = container.items[1] as VariableType;

      expect(variable.inputA).toEqual(input);
      expect(variable.numberOfInputs).toBe(1);
      expect(variable.computedValueIncludingError).toEqual({value: 999.9});
      expect(variable.computedValue).toBe(999.9);

    });

    it("with 2 inputs and no operation it returns an error", () => {
      const container = GenericContainer.create({
        items: [
          {id: "inputA", value: 999.9},
          {id: "inputB", value: 111.1},
          {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB"}
        ]
      });
      const variable = container.items[2] as VariableType;

      expect(variable.numberOfInputs).toBe(2);
      expect(variable.computedValueIncludingError).toEqual({error: "no operation"});
      expect(variable.computedValue).toBeUndefined();
    });

    it("with 2 inputs and operation Multiply it returns result", () => {
      const container = GenericContainer.create({
        items: [
          {id: "inputA", value: 999},
          {id: "inputB", value: 111},
          {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
           operation: Operation.Multiply}
        ]
      });
      const variable = container.items[2] as VariableType;

      expect(variable.numberOfInputs).toBe(2);
      expect(variable.computedValueIncludingError).toEqual({value: 110_889});
      expect(variable.computedValue).toBe(110_889);
    });

    it("with 1 different unit input it returns the converted input value, ignoring its own value", () => {
      const container = GenericContainer.create({
        items: [
          {id: "input", value: 999.9, unit: "mm"},
          {id: "variable", value: 123.5, inputA: "input", unit: "cm"}
        ]
      });
      const input = container.items[0] as VariableType;
      const variable = container.items[1] as VariableType;

      expect(variable.inputA).toEqual(input);
      expect(variable.numberOfInputs).toBe(1);
      expect(variable.computedValueIncludingError).toEqual({value: 99.99});
      expect(variable.computedValue).toBe(99.99);
    });

    it("with 1 incompatible unit input it returns an error", () => {
      const container = GenericContainer.create({
        items: [
          {id: "input", value: 999.9, unit: "mm"},
          {id: "variable", value: 123.5, inputA: "input", unit: "N"}
        ]
      });
      const input = container.items[0] as VariableType;
      const variable = container.items[1] as VariableType;

      expect(variable.inputA).toEqual(input);
      expect(variable.numberOfInputs).toBe(1);
      expect(variable.computedValueIncludingError).toEqual({error: "Error in unit conversion"});
      expect(variable.computedValue).toBeUndefined();
    });

    it("with 2 inputs with units and operation Multiply it returns result", () => {
      const container = GenericContainer.create({
        items: [
          {id: "inputA", value: 999, unit: "m"},
          {id: "inputB", value: 111, unit: "m"},
          {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
           operation: Operation.Multiply}
        ]
      });
      const variable = container.items[2] as VariableType;

      expect(variable.numberOfInputs).toBe(2);
      expect(variable.computedValueIncludingError).toEqual({value: 110_889});
      expect(variable.computedValue).toBe(110_889);
    });

    // FIXME: this should be fixed
    it("with 2 inputs with units, operation Multiply, " + 
       "and different compatible output unit it ignores the unit", () => {
      const container = GenericContainer.create({
        items: [
          {id: "inputA", value: 999, unit: "m"},
          {id: "inputB", value: 111, unit: "m"},
          {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
           operation: Operation.Multiply, unit: "mm^2"}
        ]
      });
      const variable = container.items[2] as VariableType;

      expect(variable.numberOfInputs).toBe(2);
      expect(variable.computedValueIncludingError).toEqual({value: 110_889});
      expect(variable.computedValue).toBe(110_889);
      expect(variable.computedUnit).toBe("m ^ 2");
    });

  });
});
