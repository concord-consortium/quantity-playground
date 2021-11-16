import { IAnyComplexType, Instance, types } from "mobx-state-tree";
import { getUnitConversion } from "./unit-conversion";


export enum Operation {
    Divide = "÷",
    Multiply = "×",
    Add = "+",
    Subtract = "-"
}

export const DQNode = types.model("BasicNode", {
    id: types.identifier,
    name: types.maybe(types.string),
    unit: types.maybe(types.string),
    value: types.maybe(types.number),
    // error: types.maybe(types.string),   
    inputA: types.maybe(types.reference(types.late((): IAnyComplexType => DQNode))),
    inputB: types.maybe(types.reference(types.late((): IAnyComplexType => DQNode))),
    operation: types.maybe(types.enumeration<Operation>(Object.values(Operation)))
})
    .views(self => ({
        // previous node values override current node values
        get computedValue() {
            if ((self.inputA && !self.inputB) || (self.inputB && !self.inputA)) {
                // use of `this` is recommended in MST docs for referring to a computed property
                // that is defined in the same views block. 
                // Using self fails because typescript doesn't know about the newly added 
                // property on self.
                const input = this.inputA || this.inputB;

                const convertValue = getUnitConversion(input.computedUnit, this.computedUnit);
                if (convertValue) {
                    // This is a side effect
                    // self.error = undefined;
                    return convertValue(input.computedValue);
                }
                console.error("Error in unit conversion");
                // This is a side effect
                // self.error = "Error in unit conversion";
                return input.computedValue;
            }
            if (self.inputA && self.inputB) {
                // We ignore units in this case
                switch (self.operation) {
                    case "÷":
                        return this.inputA.computedValue / this.inputB.computedValue;
                    case "×":
                        return this.inputA.computedValue * this.inputB.computedValue;
                    case "+":
                        return this.inputA.computedValue + this.inputB.computedValue;
                    case "-":
                        return this.inputA.computedValue - this.inputB.computedValue;
                    default:
                        break;
                }
            }
            return self.value;
        },
        // If there are two inputs then units can't be changed
        // otherwise current node units override previous node units
        get computedUnit() {
            if (self.inputA && self.inputB && self.operation) {
                const inputAUnit = this.inputA.computedUnit || "unknown";
                const inputBUnit = this.inputB.computedUnit || "unknown";
                switch (self.operation) {
                    case "÷":
                        return `${inputAUnit}/${inputBUnit}`;
                    case "×":
                        return `${inputAUnit}×${inputBUnit}`;
                    case "+":
                    case "-":
                        if (inputAUnit !== inputBUnit) {
                            console.error("Incompatible units");
                            return "error";
                        }
                        return inputAUnit;
                    default:
                        break;
                }

            }
            if (self.unit) {
                return self.unit;
            }
            if ((self.inputA && !self.inputB) || (self.inputB && !self.inputA)) {
                const input = this.inputA || this.inputB;
                return input.computedUnit;
            }
            return undefined;
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
        }
    }));
