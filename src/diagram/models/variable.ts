import math, { parse, SymbolNode } from "mathjs";
import { IAnyComplexType, Instance, types } from "mobx-state-tree";
import { nanoid } from "nanoid";

import { getMathUnit, getUsedInputs, replaceInputNames } from "../utils/mathjs-utils";
import { createMath } from "../custom-mathjs";
import { basicErrorMessage, ErrorMessage, getErrorMessage } from "../utils/error";
import { Colors, legacyColors } from "../utils/theme-utils";

export enum Operation {
  Divide = "÷",
  Multiply = "×",
  Add = "+",
  Subtract = "-"
}

// This is used to help with circular definition of Variable
// Variable has inputs that are also Variables
export interface IVariable  { // build needs to know dq-node to have access to this
  name?: string;
  computedValue?: number;
  computedUnit?: string;
  mathValue?: number | math.Unit;
  mathValueWithValueOr1?: number | math.Unit;
}

export const Variable = types.model("Variable", {
  id: types.optional(types.identifier, () => nanoid(16)),
  name: types.maybe(types.string),
  description: types.maybe(types.string),
  unit: types.maybe(types.string),
  value: types.maybe(types.number),
  inputs: types.array(types.maybe(types.safeReference(types.late((): IAnyComplexType => Variable)))),
  operation: types.maybe(types.enumeration<Operation>(Object.values(Operation))),
  expression: types.maybe(types.string),
  color: types.optional(types.string, Colors.LightGray)
})
.preProcessSnapshot(sn => {
  // Make sure color value is valid.
  const snClone = { ...sn };
  const validColors = Object.values(Colors);
  if (!validColors.includes(snClone.color as Colors)) {
    const legacyColor = legacyColors.find(c => c.hex === snClone.color);
    snClone.color = legacyColor ? legacyColor.replacement : Colors.LightGray;
  }

  // null values have been encountered in the field.
  // It would be good to discover how these null values are being created, but until then we can
  // at least gracefully handle them.
  if (snClone.value == null) {
    const { value, ...others } = snClone;
    return others;
  }
  return snClone;
})
.views(self => ({
  get math() {
    return createMath();
  },
  get numberOfInputs() {
    const validInputs = self.inputs.filter(input => !!input);
    return validInputs.length;
  }
}))
.views(self => ({
  get hasInputs() {
    return self.numberOfInputs > 0;
  },
}))
.views(self => ({
  get inputNames() {
    const nodeInputs = self.inputs as IVariable[];
    return nodeInputs.map(input => input.name);
  }
}))
.views(self => ({
  get processedExpression() {
    if (self.expression) {
      // TODO: To handle input node renaming and port moving,
      // we need to store the expression in its processed form.
      // Then view reverses this. This way it will update when the nodes
      // change.
      return replaceInputNames(self.expression, self.inputNames, self.math);
    }
  },
  get inputsInExpression() {
    if (self.expression) {
      return getUsedInputs(self.expression, self.inputNames, self.math);
    }
  },
  get calculationString() {
    // The calculation string is a representation of the expression with
    // the variable names replaced by their associated values and units.
    if (self.expression) {
      try {
        const expressionNode = parse(self.expression);
        const calculation = expressionNode.transform((node) => {
          if (node.type === "SymbolNode") {
            const inputs = self.inputs as IVariable[];
            const input = inputs.find(i => i.name === node.name);
            return new SymbolNode(`${input?.computedValue} ${input?.computedUnit}`);
          } else {
            return node;
          }
        });
        return calculation.toString();
      } catch (e) {
        return "";
      }
    }
  }
}))
.views(self => ({
  get mathValue() {
    const selfComputedUnit = this.computedUnitIncludingMessageAndError.unit;
    const selfComputedValue = this.computedValueIncludingMessageAndError.value;
    // The value can be 0
    if (selfComputedValue !== undefined) {
      if (selfComputedUnit) {
        // This will add any custom units
        return getMathUnit(selfComputedValue, selfComputedUnit, self.math);
      } else {
        return selfComputedValue;
      }
    }
  },

  // We use the value if it is set otherwise we use 1. This is used when
  // computing the unit. And the the unit code automatically converts the
  // prefixes when the values are large or small. So to make sure the unit
  // matches the computed value we need to use the actual value
  get mathValueWithValueOr1() {
    const selfComputedUnit = this.computedUnitIncludingMessageAndError.unit;
    const value = this.computedValueIncludingMessageAndError.value ?? 1;
    if (selfComputedUnit) {
      // This will add any custom units
      return getMathUnit(value, selfComputedUnit, self.math);
    } else {
      return value;
    }
  },

  get computedValueIncludingMessageAndError(): {value?: number, error?: ErrorMessage, message?: ErrorMessage} {
    const nodeInputs = self.inputs as IVariable[];
    if (self.numberOfInputs === 0) {
      return {value: self.value};
    }

    const expression = self.processedExpression;
    if (!expression) {
      // If there is just one input the expression will be the label of the
      // input. So we should never get here. If the there are 2 inputs then the
      // expression will only be available if the operation is set.
      return {error: basicErrorMessage("no expression")};
    }

    // Validate the inputs
    for (const input of nodeInputs) {
      if (!input) {
        // this input is not connected
        continue;
      }

      // TODO: you can make an expression that only uses one input and the other
      // input is connected but not used. In that case the unused input should be skipped.
      //
      // Currently if an unused input doesn't have a value, the output will show
      // NaN because of the validation below.

      // The mathValue could be a number so a falsy check can't be used
      try {
        if (input.mathValue !== undefined) {
          // this input should be fine
          continue;
        }
      } catch (error) {
        // TODO: this can happen when there is a cycle, perhaps it can happen in other cases
        // MobX errors do not provide programmatically readable info. They are also different
        // in development mode. The code for this can be seen here: 
        // https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/errors.ts
        // In this case, 
        // - in development mode we could check for: "[MobX] Cycle detected"
        // - in production we'd check for: "[MobX] minified error nr: 32"
        // If we add this kind of check we need to add Jest tests which can trigger
        // the error in both environments so we will know if MobX changes these strings
        console.warn("error reading input.mathValue", error);
        return {error: basicErrorMessage("cycles or loops between cards is not supported")};
      }

      // If the input mathValue is undefined then we can't compute the result.
      // Instead we return some information

      if (input.computedValue !== undefined) {
        // If the mathValue is undefined but the computedValue is valid,
        // that should mean there is an error in the units.
        // Provide a generic error message for now
        return {message: basicErrorMessage("cannot compute value from inputs")};
      } else {
        // If mathValue and computedValue are undefined,
        // the input node/card might be showing an error or message itself.
        //
        // Or the input node might only have a unit and the user is just
        // doing unit algebra.
        //
        // In both cases it is best to not show an explicit error. By returning
        // an empty object the current UI will just show NaN for the value.
        return {};
      }
    }

    const getMathValues = () => {
      const valueObj: Record<string, number| math.Unit | undefined> = {};
      nodeInputs.forEach((input,idx) => valueObj[`input_${idx}`] = input.mathValue);
      return valueObj;
    };
    const mathValues = getMathValues();
    try {
      const result = self.math.evaluate(expression, mathValues);
      const resultType = typeof result;
      if (self.math.isUnit(result)) {
        // We need to use simplify here so we are consistent with the unit
        // calculation. The simplify function will convert the prefix of
        // units based on the size of the value.
        const simpl = result.simplify();
        return {value: simpl.toNumber()};
      } else if (resultType === "number") {
        return {value: result};
      } else {
        // In theory math.js can return other kinds of results arrays, big
        // numbers, ...  With the current code that shouldn't be possible
        // but when we allow expressions it will be more likely to happen
        return {error: basicErrorMessage(`unknown result type: ${resultType}`)};
      }
    } catch (e: any) {
      // TODO: we should find a way to handle this without throwing an
      // exception, but I think that will mean changes to MathJS
      return {error: getErrorMessage({ errorMessage: e.message })};
    }
  },

  // If there are two inputs then units can't be changed
  // otherwise current node units override previous node units
  get computedUnitIncludingMessageAndError(): {unit?: string, error?: ErrorMessage, message?: ErrorMessage} {
    const nodeInputs = self.inputs as IVariable[];
    if (self.numberOfInputs === 0) {
      // Just return the current unit.
      // The current unit might be undefined
      return {unit: self.unit};
    }

    const expression = self.processedExpression;
    if (!expression) {
      // We should only have an empty expression if there are two inputs and the
      // operation is not set.
      // With a single input the expression should always be set.
      // The computedValue above will already include a message about this, so it is
      // not reported here too.
      return {};
    }

    // Validate the inputs
    for (const input of nodeInputs) {
      if (!input) {
        // this input is not connected
        continue;
      }

      try {
        // The input value could be a number so we can't use falsy here
        if (input.mathValueWithValueOr1 === undefined) {
          // Because we are using `1` if there is no input value, and we just
          // return the value if there is no unit, the only reason the
          // mathValueWithValueOr1 should be undefined is if there is an error with the
          // input unit.
          return {error: basicErrorMessage("invalid input units")};
        }
      } catch (error) {
        // TODO: this can happen when there is a cycle, perhaps it can happen in other cases too?
        // See the TODO comment about cycles above for more info.
        console.warn("error reading input.mathValueWithValueOr1", error);
        return {error: basicErrorMessage("cycles or loops between cards is not supported")};
      }
    }

    const getMathValues = () => {
      const valueObj: Record<string, number | math.Unit | undefined> = {};
      nodeInputs.forEach((input,idx) => valueObj[`input_${idx}`] = input.mathValueWithValueOr1);
      return valueObj;
    };
    const mathValues = getMathValues();
    try {
      const result = self.math.evaluate(expression, mathValues);
      if (self.math.isUnit(result)) {
        const unitString = result.simplify().formatUnits();
        if (unitString === "") {
          // This seems to be unreachable currently, but it is possible for
          // MathJS to return the empty string in some cases. See the test
          // "...units cancel on manually created unit"
          return {message: basicErrorMessage("units cancel")};
        } else {
          return {unit: unitString};
        }
      } else {
        if (nodeInputs.some(input => input?.computedUnit)) {
          // If one of the inputs has units and the result is not a Unit
          // that should mean the units have canceled
          return {message: basicErrorMessage("units cancel")};
        } else {
          // If neither input has a unit then this is unit-less math so it has
          // no unit and it isn't an error.
          return {};
        }
      }
    } catch (e: any) {
      // TODO: we should find a way to handle this without throwing an
      // exception, but I think that will mean changes to MathJS
      // TODO: self.unit was not included here previously. Will it cause problems to include it?
      return {unit: self.unit, error: getErrorMessage({ errorMessage: e.message })};
    }
  }
}))
.views(self => ({
  get computedValue() {
    return self.computedValueIncludingMessageAndError.value;
  },
  get computedValueWithSignificantDigits() {
    // Currently this just uses a fixed set of fractional digits instead of keeping track of
    // significant digits
    const value = self.computedValueIncludingMessageAndError.value;

    // In practice Chrome's format returns "NaN" for undefined values, but typescript
    // isn't happy with passing undefined
    if (value === undefined) {
      return "NaN";
    }
    // The first argument is the locale, using undefined means it should pick up the default
    // browser locale
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(value);
  },
  get computedValueError() {
    return self.computedValueIncludingMessageAndError.error;
  },
  get computedValueMessage() {
    return self.computedValueIncludingMessageAndError.message;
  },
  get computedUnit() {
    return self.computedUnitIncludingMessageAndError.unit;
  },
  get computedUnitError() {
    return self.computedUnitIncludingMessageAndError.error;
  },
  get computedUnitMessage() {
    return self.computedUnitIncludingMessageAndError.message;
  },
}))
.views(self => ({
  get errorMessage() {
    return self.computedUnitError ?? self.computedValueError;
  },
  get displayValue() {
    return self.hasInputs ? self.computedValue : self.value;
  },
  get displayUnit() {
    return self.hasInputs ? self.computedUnit : self.unit;
  }
}))
.actions(self => ({
  addInput(newInput: Instance<IAnyComplexType> | undefined) {
    self.inputs.push(newInput);
  },
  setValue(newValue?: number) {
    // NaN and Infinity are not valid JSON, we can probably fix MST to handle this correctly
    // but for now we just convert it to undefined to be safe.
    self.value = newValue != null && isFinite(newValue) ? newValue : undefined;
  },
  setUnit(newUnit?: string) {
    self.unit = newUnit;
  },
  setName(newName?: string) {
    self.name = newName;
  },
  setDescription(newDescription?: string) {
    self.description = newDescription;
  },
  setOperation(newOperation?: Operation) {
    self.operation = newOperation;
  },
  setExpression(newExpression?: string) {
    self.expression = newExpression;
  },
  setColor(newColor:string) {
    self.color = newColor;
  }
}))
.actions(self => ({
  removeInput(input: VariableType) {
    const _var = self.inputs as unknown as VariableType[];
    const inputToRemove = _var.find(i => i?.id === input.id);
    const inputIdx = self.inputs.indexOf(inputToRemove);
    inputIdx > -1 && self.inputs.splice(inputIdx, 1);
  },
}));
export interface VariableType extends Instance<typeof Variable> {}
