import { IAnyComplexType, Instance, SnapshotIn, types } from "mobx-state-tree";
import { nanoid } from "nanoid";
import { ArrowHeadType, Elements } from "react-flow-renderer/nocss";
import { Operation, Variable, VariableType } from "./variables";

export const DQNode = types.model("DQNode", {
  id: types.optional(types.identifier, () => nanoid(16)),
  variable: types.reference(Variable),

  // The x and y values are required when initializing the react flow
  // component. However the react flow component ignores them after this.
  // To serialize the state the positions need to be extracted from the react flow
  // and then applied to the models.
  x: types.number,
  y: types.number
})
.views(self => ({
  get reactFlowElements() {
    const elements: Elements = [];
    const {id} = self.variable;
    const inputA = self.variable.inputA as VariableType | undefined;
    const inputB = self.variable.inputB as VariableType | undefined;
    elements.push({
        id,
        type: "quantityNode",
        data: { node:  self },
        position: { x: self.x, y: self.y },
    });
    if (inputA) {
        elements.push({
            id: `e${inputA.id}-${id}-a`,
            source: inputA.id,
            target: id,
            targetHandle: "a",
            arrowHeadType: ArrowHeadType.ArrowClosed
        });
    }
    if (inputB) {
        elements.push({
            id: `e${inputB.id}-${id}-b`,
            source: inputB.id,
            target: id,
            targetHandle: "b",
            arrowHeadType: ArrowHeadType.ArrowClosed
        });
    }

    return elements;
  },

  get value() {
    return self.variable.value;
  },

  get name() {
    return self.variable.name;
  },

  get unit() {
    return self.variable.unit;
  },

  get operation() {
    return self.variable.operation;
  },

  get computedValueWithSignificantDigits() {
    return self.variable.computedValueWithSignificantDigits;
  },

  get computedUnit() {
    return self.variable.computedUnit;
  },

  get computedValueError() {
    return self.variable.computedValueError;
  },

  get computedUnitError() {
    return self.variable.computedUnitError;
  },

  get computedUnitMessage() {
    return self.variable.computedUnitMessage;
  }
}))
.actions(self => ({

  // Note: as far as I know React Flow will ignore this change
  // it only pays attention to the position of the node when the
  // diagram is first initialized
  updatePosition(x: number, y: number) {
    self.x = x;
    self.y = y;
  },

  setInputA(newInputA: Instance<IAnyComplexType> | undefined) {    
    self.variable.setInputA((newInputA as any)?.variable);
  },

  setInputB(newInputB: Instance<IAnyComplexType> | undefined) {    
    self.variable.setInputB((newInputB as any)?.variable);
  },

  setValue(value?: number) {
    self.variable.setValue(value);
  },

  setUnit(unit?: string) {
    self.variable.setUnit(unit);
  },

  setName(name?: string) {
    self.variable.setName(name);
  },

  setOperation(operation?: Operation) {
    self.variable.setOperation(operation);
  }
}));
export interface DQNodeType extends Instance<typeof DQNode> {}
export interface DQNodeSnapshot extends SnapshotIn<typeof DQNode> {}
