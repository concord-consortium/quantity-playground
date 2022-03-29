import { evaluate } from "../custom-mathjs";
import { IAnyComplexType, Instance, types } from "mobx-state-tree";
import { nanoid } from "nanoid";

import { getMathUnit, getUnitConversion } from "./unit-conversion";
import { Unit } from "mathjs";

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
  },
  get expression() {
    switch (self.operation) {
      case "÷":
        return "a / b";
      case "×":
        return "a * b";
      case "+":
        return "a + b";
      case "-":
        return "a - b";
    }
  }
}))
.views(self => ({
  get mathValue() {
    const selfComputedUnit = this.computedUnitIncludingMessageAndError.unit;
    const selfComputedValue = this.computedValueIncludingMessageAndError.value;
    if (selfComputedValue) {
      if (selfComputedUnit) {
        // This will add any custom units
        return getMathUnit(selfComputedValue, selfComputedUnit);
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
      return getMathUnit(value, selfComputedUnit);
    } else {
      return value;
    }
  },

  get computedValueIncludingMessageAndError(): {value?:number, error?:string, message?: string} {
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
      const expression = self.expression;
      if (expression) {
        // @ts-expect-error THIS
        const inputAMathValue = this.inputA.mathValue;
        // @ts-expect-error THIS
        const inputBMathValue = this.inputB.mathValue;

        if (!inputAMathValue || !inputBMathValue) {
          // TODO: we should provide a better message here. This message can
          // overlap with the message from the computedValueIncludingError.
          // So we need to look at the cases when this happens find a better way
          // to handle it.
          return {message: "cannot compute value from inputs"};
        }

        try {
          const result = evaluate(expression, {a: inputAMathValue, b: inputBMathValue});
          const resultType = typeof result;
          if (resultType === "object" && "isUnit" in result) {
            // FIXME we sometimes use the `Unit` symbol as a type and sometimes as a
            // object in order to access static class methods. We need to be
            // consistent.
            const unitResult = result as Unit;
            // We need to use simplify here so we are consistent with the unit
            // calculation. The simplify function will convert the prefix of
            // units based on the size of the value.
            const simpl = unitResult.simplify();
            return {value: simpl.toNumber()};
          } else if (resultType === "number") {
            return {value: result};
          } else {
            // In theory math.js can return other kinds of results arrays, big
            // numbers, ...  With the current code that shouldn't be possible
            // but when we allow expressions it will be more likely to happen
            return {error: `unknown result type: ${resultType}`};
          }
        } catch (e: any) {
          // TODO: we should find a way to handle this without throwing an
          // exception, but I think that will mean changes to MathJS
          //
          // We should update MathJS to provide more information here. For other
          // errors MathJS provides a data property on the error that includes
          // the character location and more info about the error.
          if (e.message?.startsWith("Units do not match")) {
            return {error: "incompatible units"};
          } else {
            return {error: `unknown error: ${e.message}`};
          }
        }
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
      const expression = self.expression;
      if (expression) {
        // @ts-expect-error THIS
        const inputAMathValue = this.inputA.mathValueWithValueOr1;
        // @ts-expect-error THIS
        const inputBMathValue = this.inputB.mathValueWithValueOr1;
        
        if (!inputAMathValue || !inputBMathValue) {
          // The unit must be invalid
          return {error: "invalid input units"};
        }

        try {
          const result = evaluate(expression, {a: inputAMathValue, b: inputBMathValue});
          if (typeof result == "object" && "isUnit" in result) {
            // FIXME we sometimes use the `Unit` symbol as a type and sometimes as a
            // object in order to access static class methods. We need to be
            // consistent.
            const unitResult = result as Unit;
            const unitString = unitResult.simplify().formatUnits();
            if (unitString === "") {
              return {message: "units cancel"};
            } else {
              return {unit: unitString};
            }
          } else {
            // @ts-expect-error THIS
            if (this.inputA.computedUnit || this.inputB.computedUnit) {
              // If one of the inputs has units and the result is not a Unit
              // that should mean the units have canceled
              return {message: "units cancel"};
            } else {
              // TODO: should we return something else here? It seems reasonable to
              // do an operation on to unitless values. So for now don't show
              // any warning.
              return {};
            }
          }
        } catch (e: any) {
          // TODO: we should find a way to handle this without throwing an
          // exception, but I think that will mean changes to MathJS
          //
          // If we have to throw an exception we should update MathJS to provide
          // more information here. For other errors, MathJS provides a data
          // property on the error that includes the character location and more
          // info about the error.
          if (e.message?.startsWith("Units do not match")) {
            return {error: "incompatible units"};
          } else {
            return {error: `unknown error: ${e.message}`};
          }
        }
      } else {
        // We have 2 inputs (with or without units), but no operation
        // The computedValue code above is already going to provide a warning about
        // this
        return {};
      }
    }
    if (self.unit) {
      // FIXME: we should see if this is valid instead of blindly returning it,
      // this should fall out of the refactoring to unify single and multiple inputs
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
