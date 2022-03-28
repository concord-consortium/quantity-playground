import { IAnyComplexType, Instance, types } from "mobx-state-tree";
import { nanoid } from "nanoid";

import { getUnitConversion } from "./unit-conversion";
import { tryToSimplify } from "./unit-simplify";

export enum Operation {
  Divide = "÷",
  Multiply = "×",
  Add = "+",
  Subtract = "-"
}

export const Variable = types.model("Variable", {
  id: types.optional(types.identifier, () => nanoid(16)),
  name: types.maybe(types.string),
  unit: types.maybe(types.string),
  // null values have been seen in the implementation
  // hopefully we can track down where those come from instead of making this
  // more complex. If we do have to handle this, here is how it was done before:
  //     .preProcessSnapshot(sn => {
  //       // null values have been encountered in the field
  //       if (sn.value == null) {
  //         const { value, ...others } = sn;
  //         return others;
  //     }
  //     return sn;
  // })
  value: types.maybe(types.number), 
  inputA: types.maybe(types.safeReference(types.late((): IAnyComplexType => Variable))),
  inputB: types.maybe(types.safeReference(types.late((): IAnyComplexType => Variable))),
  operation: types.maybe(types.enumeration<Operation>(Object.values(Operation))),
})
.views(self => ({
  get numberOfInputs() {
    let count = 0;
    if (self.inputA) {
        count++;
    }
    if (self.inputB) {
        count++;
    }
    return count;
  },
  get firstValidInput() {
      return self.inputA || self.inputB;
  }
}))
.views(self => ({
  // previous node values override current node values
  get computedValueIncludingError(): {value?:number, error?:string} {
    if ((self.numberOfInputs === 1)) {
      // We have to cast the input to any because we are calling the functions
      // computedUnit and computedValue
      // Those functions are what we are defining here so TS doesn't know they exist on DQNode yet.
      const input = self.firstValidInput as any;

      // @ts-expect-error THIS
      const convertValue = getUnitConversion((input).computedUnit, this.computedUnit);
      if (convertValue) {
          return {value: convertValue(input.computedValue)};
      }
      return {error: "Error in unit conversion"};
    }

    if (self.inputA && self.inputB) {
      // We currently ignore units in this case
      let value;
      switch (self.operation) {
        case "÷":
          // @ts-expect-error THIS
          value = this.inputA.computedValue / this.inputB.computedValue;
          break;
        case "×":
          // @ts-expect-error THIS
          value = this.inputA.computedValue * this.inputB.computedValue;
          break;
        case "+":
          // @ts-expect-error THIS
          value = this.inputA.computedValue + this.inputB.computedValue;
          break;
        case "-":
          // @ts-expect-error THIS
          value = this.inputA.computedValue - this.inputB.computedValue;
          break;
        default:
          break;
      }
      if (self.operation) {
        return {value};
      } else {
        return {error: "no operation"};
      }
    }
    return {value: self.value};
  },
  
  // If there are two inputs then units can't be changed
  // otherwise current node units override previous node units
  get computedUnitIncludingMessageAndError(): {unit?: string, error?: string, message?: string} {
    if (self.inputA && self.inputB) {
      if (self.operation) {
        // If there is no unit, then use "1", that way the simplification of multiplication
        // and division will work properly
        // @ts-expect-error THIS
        const inputAUnit = this.inputA.computedUnit;
        // @ts-expect-error THIS
        const inputBUnit = this.inputB.computedUnit;
        switch (self.operation) {
          case "÷":
          case "×":
            return tryToSimplify(self.operation, inputAUnit, inputBUnit);
          case "+":
          case "-":
            if (inputAUnit !== inputBUnit) {
              return {error: "incompatible units"};
            }
            return {unit: inputAUnit};
          default:
            break;
        }
      } else {
        // We have 2 inputs (with or without units), but no operation
        // The computedValue code above is already going to provide a warning about
        // this
        return {};
      }
    }
    if (self.unit) {
      return {unit: self.unit};
    }
    if ((self.inputA && !self.inputB) || (self.inputB && !self.inputA)) {
      // @ts-expect-error THIS
      const input = this.inputA || this.inputB;
      return {unit: input.computedUnit};
    }
    if (!self.inputA && !self.inputB && !self.unit) {
      // There is no unit specified and no input unit
      // this might be on purpose for a unit-less operation
      return {};
    }
    // We really shouldn't reach here
    return {error: "unknown unit state"};
  }
}))
.views(self => ({
  get computedValue() {
    return self.computedValueIncludingError.value;
  },
  get computedValueWithSignificantDigits() {
    // Currently this just uses a fixed set of fractional digits instead of keeping track of
    // significant digits
    const value = self.computedValueIncludingError.value;

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
    return self.computedValueIncludingError.error;
  },
  get computedUnit() {
    return self.computedUnitIncludingMessageAndError.unit;
  },
  get computedUnitError() {
    return self.computedUnitIncludingMessageAndError.error;
  },
  get computedUnitMessage() {
    return self.computedUnitIncludingMessageAndError.message;
  }
}))
.actions(self => ({
  setInputA(newInputA: Instance<IAnyComplexType> | undefined) {
    self.inputA = newInputA;
  },
  setInputB(newInputB: Instance<IAnyComplexType> | undefined) {
    self.inputB = newInputB;
  },
  setValue(newValue?: number) {
    self.value = newValue;
  },
  setUnit(newUnit?: string) {
    self.unit = newUnit;
  },
  setName(newName?: string) {
    self.name = newName;
  },
  setOperation(newOperation?: Operation) {
    self.operation = newOperation;
  },
}));
export interface VariableType extends Instance<typeof Variable> {}
