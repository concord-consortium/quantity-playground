import { getSnapshot } from "mobx-state-tree";
import { GenericContainer } from "./test-utils";
import { Operation, Variable, VariableType } from "./variable";
import { incompatibleUnitsShort } from "../utils/error";
import { addCustomUnit } from "../custom-mathjs-units";

describe("Variable", () => {
  it("Can be created", () => {
    const variable = Variable.create();

    // It should have an id with a length of 16
    expect(variable.id).toBeDefined();
    expect(variable.id).toHaveLength(16);
  });

  it("with no inputs, its own value, and no unit", () => {
    const variable = Variable.create({value: 123.5});
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 123.5});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
    expect(variable.computedValue).toBe(123.5);
    expect(variable.computedValueWithSignificantDigits).toBe("123.5");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedValueMessage).toBeUndefined();
    expect(variable.computedUnit).toBeUndefined();
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
  });

  it("with no inputs, null value (an error case that arrises for mysterious reasons)", () => {
    const variable = Variable.create({value: null} as any);
    expect(variable.value).toBeUndefined();
  });

  it("with 1 inputA it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 999.9},
        {id: "variable", expression: "a", value: 123.5, inputs: ["input"]}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputs[0]).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedValue).toBe(999.9);

  });

  it("with 1 inputA of 0 it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 0},
        {id: "variable", expression: "a", value: 123.5, inputs: ["input"]}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputs[0]).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedValue).toBe(0);
    expect(variable.displayValue).toBe(0);
    expect(variable.displayUnit).toBe(undefined);

  });

  it("with 2 inputs and no expression it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999.9},
        {id: "inputB", value: 111.1},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"]}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual("Warning: no expression");
    expect(variable.computedValue).toBeUndefined();
    // The no operation is not included in the units
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
    expect(variable.calculationString).toBeUndefined();
  });

  it("with 2 inputs and no expression and a unit, it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999.9},
        {id: "inputB", value: 111.1},
        {id: "variable", value: 123.5, unit: "m", inputs: ["inputA", "inputB"]}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual("Warning: no expression");
    expect(variable.computedValue).toBeUndefined();
    // The no operation is not included in the units
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
  });

  it("with 2 inputs and operation Multiply it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 999},
        {id: "inputB", name: "b", value: 111},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a*b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 110_889});
    expect(variable.computedValue).toBe(110_889);
  });

  it("with only a unit'd inputA and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 999.9, unit: "mm"},
        {id: "variable", expression: "a", value: 123.5, inputs: ["input"]}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputs[0]).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
    expect(variable.computedValue).toBe(999.9);
    expect(variable.computedValueWithSignificantDigits).toBe("999.9");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBe("mm");
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
    expect(variable.calculationString).toBe("999.9 mm");
    expect(variable.displayValue).toBe(999.9);
    expect(variable.displayUnit).toBe("mm");
  });

  it("with only a unit'd inputA of 0 and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 0, unit: "mm"},
        {id: "variable", expression: "a", value: 123.5, inputs: ["input"]}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with 1 valueless unit input it returns the input unit, ignoring its own unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", unit: "mm"},
        {id: "variable", unit: "cats", inputs: ["input"], expression: "a"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with 1 unit input it returns the input unit and value, ignoring its own unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 1, unit: "mm"},
        {id: "variable", unit: "cats", inputs: ["input"], expression: "a"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with 1 different unit input it returns the converted input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputs: ["input"], expression: "a to cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 99.99});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 different unit input of 0 it returns the converted input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 0, unit: "mm"},
        {id: "variable", value: 123.5, inputs: ["input"], expression: "a to cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 different valueless unit input it returns the converted unit, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", unit: "mm"},
        {id: "variable", value: 123.5, inputs: ["input"], expression: "a to cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 incompatible unit input it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputs: ["input"], expression: "a to seconds"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputs[0]).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    // TODO: this case should be checked with project leaders: do we want to
    // pass the unit through to future nodes that depend on this one when there
    // is an error like this?
    // Reason to pass it through:
    //   it limits the number of error messages shown so it would be easier to
    //   track down the problem.
    // Reason not to pass it through:
    //   If the user is only looking at the final output they might notice they
    //   have an error in their units further up the chain
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedValueWithSignificantDigits).toBe("NaN");
    expect(variable.computedValueError?.short).toBe(incompatibleUnitsShort);
    expect(variable.computedUnit).toBeUndefined();
    expect(variable.computedUnitError?.short).toBe(incompatibleUnitsShort);
    expect(variable.computedUnitMessage).toBeUndefined();

  });

  it("with 1 incompatible valueless unit input it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", unit: "mm"},
        {id: "variable", value: 123.5, inputs: ["input"], expression: "a to seconds"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputs[0]).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedValueWithSignificantDigits).toBe("NaN");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBeUndefined();
    expect(variable.computedUnitError?.short).toBe(incompatibleUnitsShort);
    expect(variable.computedUnitMessage).toBeUndefined();

  });

  it("with a compound custom unit input and a compatible compound custom unit it does the conversion", () => {
    addCustomUnit("thing", { aliases: ["things"] });
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 9, unit: "m/things"},
        {id: "variable", inputs: ["input"], expression: "a to cm/things"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 900});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm / things"});
  });

  it("with a invalid unit in A it returns without crashing", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", name: "a", value: 9, unit: "m/"},
        {id: "variable", inputs: ["input"], expression: "a to cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError.message?.short).toEqual("Warning: cannot compute value from inputs");
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual("Warning: invalid input units");

  });

  it("with 2 inputs with units and operation multiply it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 999, unit: "m"},
        {id: "inputB", name: "b", value: 111, unit: "m"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a*b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 110_889});
    expect(variable.computedValue).toBe(110_889);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m^2"});
  });

  it("with 2 inputs with units and operation divide it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 20, unit: "m"},
        {id: "inputB", name: "b", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a/b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 2});
    expect(variable.computedValue).toBe(2);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m / s"});
  });

  it("with 2 inputs with matching units and operation add it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 20, unit: "m"},
        {id: "inputB", name: "b", value: 10, unit: "m"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 30});
    expect(variable.computedValue).toBe(30);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation add it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 20, unit: "m"},
        {id: "inputB", name: "b", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("with 2 inputs with matching units and operation subtract it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 20, unit: "m"},
        {id: "inputB", name: "b", value: 5, unit: "m"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a-b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 15});
    expect(variable.computedValue).toBe(15);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation subtract it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 20, unit: "m"},
        {id: "inputB", name: "b", value: 5, unit: "s"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a-b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("with 2 inputs with units, operation Multiply, " +
      "and different compatible output unit the unit is converted", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 2, unit: "m"},
        {id: "inputB", name: "b", value: 3, unit: "m"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a*b to mm^2"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 6_000_000});
    expect(variable.computedValue).toBe(6_000_000);
    expect(variable.computedUnit).toBe("mm^2");
  });

  it("handles a custom unit being added to the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 98, unit: "things"},
        {id: "inputB", name: "b", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 100});
    expect(variable.computedUnit).toBe("things");
  });

  it("handles a custom unit being subtracted from the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 98, unit: "things"},
        {id: "inputB", name: "b", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a-b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 96});
    expect(variable.computedUnit).toBe("things");
  });

  it("handles a custom unit divided by the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 98, unit: "things"},
        {id: "inputB", name: "b", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a/b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 49});
    expect(variable.computedUnitIncludingMessageAndError.message?.short).toEqual("Warning: units cancel");
  });

  it("handles a compound unit that includes a custom unit multiplying by the custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 50, unit: "m/things"},
        {id: "inputB", name: "b", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputs: ["inputA", "inputB"],
          expression: "a*b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 100});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles adding compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m"},
        {id: "inputB", name: "b", value: 100, unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 2});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles adding compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", unit: "m"},
        {id: "inputB", name: "b", unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles subtracting compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 2, unit: "m"},
        {id: "inputB", name: "b", value: 100, unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a-b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles subtracting compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", unit: "m"},
        {id: "inputB", name: "b", unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a-b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles dividing compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m"},
        {id: "inputB", name: "b", value: 100, unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a/b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError.message?.short).toEqual("Warning: units cancel");
  });

  it("handles dividing compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", unit: "m"},
        {id: "inputB", name: "b", unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a/b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError.message?.short).toEqual("Warning: units cancel");
  });

  it("handles dividing custom units", () => {
    addCustomUnit("widget", { aliases: ["widgets"] });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "widgets"},
        {id: "inputB", name: "b",  value: 100, unit: "widgets"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a/b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedUnitIncludingMessageAndError.message?.short).toEqual("Warning: units cancel");
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0.01});
  });

  it("handles invalid units", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m/"},
        {id: "inputB", name: "b", value: 100, unit: "s"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a*b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual("Warning: invalid input units");
    expect(variable.computedValueIncludingMessageAndError.message?.short).toEqual("Warning: cannot compute value from inputs");
  });

  it("handles adding compatible inputs first with a value and second without a value", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m"},
        {id: "inputB", name: "b", unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    // If there is no value for one of the inputs we cannot compute the output
    // value. There might be a unit.
    //
    // We don't show an explicit error here: The current UI shows NaN for the
    // value, so this seems like enough of a error message.
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("handles adding compatible inputs first without a value and second with a value", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", unit: "m"},
        {id: "inputB", name: "b", value: 1, unit: "cm"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    // If there is no value for one of the inputs we cannot compute the output
    // value. There might be a unit.
    //
    // We don't show an explicit error here: The current UI shows NaN for the
    // value, so this seems like enough of a error message.
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("shows error when adding inputs first without a unit and second with a unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1},
        {id: "inputB", name: "b", value: 1, unit: "m"},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("shows error when adding inputs first with a unit and second without a unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m"},
        {id: "inputB", name: "b", value: 1},
        {id: "variable", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("shows error when adding inputs first without a unit and second with a unit and an output unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1},
        {id: "inputB", name: "b", value: 1, unit: "m"},
        {id: "variable", unit: "m", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedUnitIncludingMessageAndError.unit).toEqual("m");
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("shows error when adding inputs first with a unit and second without a unit and an output unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", value: 1, unit: "m"},
        {id: "inputB", name: "b", value: 1},
        {id: "variable", unit: "m", inputs: ["inputA", "inputB"],
          expression: "a+b"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
    expect(variable.computedUnitIncludingMessageAndError.unit).toEqual("m");
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual(incompatibleUnitsShort);
  });

  it("shows error when a cycle exists between two variables", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", name: "a", inputs: ["inputA"], expression: "b"},
        {id: "inputB", name: "b", inputs: ["inputB"], expression: "a"},
      ]
    });
    const variable = container.items[1] as VariableType;

    const warn = jest.spyOn(console, "warn").mockImplementation(() => null);

    expect(variable.computedValueIncludingMessageAndError.error?.short).toEqual("Warning: cycles or loops between cards is not supported");
    expect(variable.computedUnitIncludingMessageAndError.error?.short).toEqual("Warning: cycles or loops between cards is not supported");
    expect(warn).toBeCalledTimes(3);
  });

  it("can be modified after being created", () => {
    const inputA = Variable.create();
    const inputB = Variable.create();
    const variable = Variable.create();
    const container = GenericContainer.create();
    container.add(inputA);
    container.add(inputB);
    container.add(variable);

    variable.addInput(inputA);
    variable.addInput(inputB);
    variable.setValue(123.5);
    variable.setUnit("m");
    variable.setName("my variable");
    variable.setOperation(Operation.Add);
    variable.setDescription("This is my variable");
    variable.setExpression("a+b");

    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
      inputs: [inputA.id, inputB.id],
      value: 123.5,
      unit: "m",
      name: "my variable",
      operation: "+",
      color: "light-gray",
      description: "This is my variable",
      expression: "a+b"
    });
  });

  it("handles edge case values", () => {
    const variable = Variable.create();

    variable.setValue(NaN);

    // NaN should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      expression: undefined,
      id: expect.stringMatching(/^.{16}$/),
      inputs: [],
      color: "light-gray",
    });

    variable.setValue(Infinity);

    // Infinity should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      expression: undefined,
      id: expect.stringMatching(/^.{16}$/),
      inputs: [],
      name: undefined,
      operation: undefined,
      unit: undefined,
      value: undefined,
      color: "light-gray"
    });

    // If someone finds a way to pass in null
    variable.setValue(null as any);

    // null should be converted to undefined
    expect(getSnapshot(variable)).toEqual({
      expression: undefined,
      id: expect.stringMatching(/^.{16}$/),
      inputs: [],
      name: undefined,
      operation: undefined,
      unit: undefined,
      value: undefined,
      color: "light-gray",
    });

    // regular numbers can be set back to undefined
    variable.setValue(123.0);
    expect(getSnapshot(variable)).toEqual({
      expression: undefined,
      id: expect.stringMatching(/^.{16}$/),
      inputs: [],
      name: undefined,
      operation: undefined,
      unit: undefined,
      value: 123.0,
      color: "light-gray",
    });

    variable.setValue(undefined);
    expect(getSnapshot(variable)).toEqual({
      expression: undefined,
      id: expect.stringMatching(/^.{16}$/),
      inputs: [],
      name: undefined,
      operation: undefined,
      unit: undefined,
      value: undefined,
      color: "light-gray",
    });

  });

  // TODO: need tests about partially created units. When the user is typing a
  // unit the code will run as they type. This will trigger the creation of a
  // custom unit for this partially typed unit. And then this unit will not be
  // removed afterwards. So now these partially typed units might cause hard to
  // understand error messages when expressions are typed by users. The
  // evaluator might interpret a missing variable as a partial unit.

});
