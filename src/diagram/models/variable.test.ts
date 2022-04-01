import { getSnapshot } from "mobx-state-tree";
import { GenericContainer } from "./test-utils";
import { Operation, Variable, VariableType } from "./variable";

describe("Variable", () => {
  it("Can be created", () => {
    const variable = Variable.create();

    // It should have an id with a length of 16
    expect(variable.id).toBeDefined();
    expect(variable.id).toHaveLength(16);
  });

  it("with no inputs, its own value, and no unit", () => {
    const variable = Variable.create({value: 123.5});
    expect(variable.computedValueIncludingError).toEqual({value: 123.5});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
    expect(variable.computedValue).toBe(123.5);
    expect(variable.computedValueWithSignificantDigits).toBe("123.5");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBeUndefined();
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
  });

  it("with 1 inputA it returns the input value, ignoring its own value", () => {
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

  it("with 1 inputB it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputB).toEqual(input);
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
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
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

  it("with only a unit'd inputA and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingError).toEqual({value: 999.9});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
    expect(variable.computedValue).toBe(999.9);
    expect(variable.computedValueWithSignificantDigits).toBe("999.9");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBe("mm");
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
  });

  it("with only a unit'd inputB and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputB).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingError).toEqual({value: 999.9});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
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
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "N"});
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedValueWithSignificantDigits).toBe("NaN");
    expect(variable.computedValueError).toBe("Error in unit conversion");
    expect(variable.computedUnit).toBe("N");
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();

  });

  it("with 2 inputs with units and operation multiply it returns result", () => {
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
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m ^ 2"});
  });

  it("with 2 inputs with units and operation divide it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingError).toEqual({value: 2});
    expect(variable.computedValue).toBe(2);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m / s"});
  });

  it("with 2 inputs with matching units and operation add it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingError).toEqual({value: 30});
    expect(variable.computedValue).toBe(30);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation add it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingError).toEqual({value: 30});
    expect(variable.computedValue).toBe(30);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  it("with 2 inputs with matching units and operation subtract it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 5, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingError).toEqual({value: 15});
    expect(variable.computedValue).toBe(15);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation subtract it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 5, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingError).toEqual({value: 15});
    expect(variable.computedValue).toBe(15);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  // FIXME: we should switch to using math.js units and then this case could be
  // handled
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

  it("can be modified after being created", () => {
    const inputA = Variable.create();
    const inputB = Variable.create();
    const variable = Variable.create();
    const container = GenericContainer.create();
    container.add(inputA);
    container.add(inputB);
    container.add(variable);

    variable.setInputA(inputA);
    variable.setInputB(inputB);
    variable.setValue(123.5);
    variable.setUnit("m");
    variable.setName("my variable");
    variable.setOperation(Operation.Add);

    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
      inputA: inputA.id,
      inputB: inputB.id,
      value: 123.5,
      unit: "m",
      name: "my variable",
      operation: "+"
    });
  });

  it("handles edge case values", () => {
    const variable = Variable.create();

    variable.setValue(NaN);

    // NaN should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
    });

    variable.setValue(Infinity);

    // Infinity should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
    });

    // If someone finds a way to pass in null
    variable.setValue(null as any);

    // null should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
    });

    // regular numbers can be set back to undefined
    variable.setValue(123.0);
    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
      value: 123.0
    });

    variable.setValue(undefined);
    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
    });

  });
});
