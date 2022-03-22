import { getSnapshot, IAnyComplexType, Instance, SnapshotIn, tryReference, types } from "mobx-state-tree";
import { nanoid } from "nanoid";
import { ArrowHeadType, Elements } from "react-flow-renderer/nocss";
import { Operation, Variable, VariableType } from "./variable";

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
  get tryVariable() {
    return tryReference(() => self.variable);
  },
  get variableId() {
    // This seems to be the only way to get the variable id in a way that works
    // even when the reference is invalid (because the variable was deleted).
    //
    // For some reason MST types this snapshot.variable to be a number even
    // though the id is a string. Casting it to string seems to work fine.
    const snapshot = getSnapshot(self);
    return snapshot.variable as string;
  },
}))
.views(self => ({
  get reactFlowElements() {
    const elements: Elements = [];
    const id = self.variableId;
    elements.push({
      id,
      type: "quantityNode",
      data: { node:  self },
      position: { x: self.x, y: self.y },
    });

    const variable = self.tryVariable;
    if (variable) {
      const inputA = self.variable.inputA as VariableType | undefined;
      const inputB = self.variable.inputB as VariableType | undefined;
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
    } 

    return elements;
  },

  get value() {
    return self.tryVariable?.value;
  },

  get name() {
    return self.tryVariable?.name;
  },

  get unit() {
    return self.tryVariable?.unit;
  },

  get operation() {
    return self.tryVariable?.operation;
  },

  get expression() {
    return self.tryVariable?.expression;
  },

  get computedValueWithSignificantDigits() {
    return self.tryVariable?.computedValueWithSignificantDigits;
  },

  get computedUnit() {
    return self.tryVariable?.computedUnit;
  },

  get computedValueError() {
    return self.tryVariable?.computedValueError;
  },

  get computedUnitError() {
    return self.tryVariable?.computedUnitError;
  },

  get computedUnitMessage() {
    return self.tryVariable?.computedUnitMessage;
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
    self.tryVariable?.setInputA((newInputA as any)?.variable);
  },

  setInputB(newInputB: Instance<IAnyComplexType> | undefined) {    
    self.tryVariable?.setInputB((newInputB as any)?.variable);
  },

  setValue(value?: number) {
    self.tryVariable?.setValue(value);
  },

  setUnit(unit?: string) {
    self.tryVariable?.setUnit(unit);
  },

  setName(name?: string) {
    self.tryVariable?.setName(name);
  },

  setOperation(operation?: Operation) {
    self.tryVariable?.setOperation(operation);
  },

  setExpression(expression?: string) {
    self.tryVariable?.setExpression(expression);
  }
}));
export interface DQNodeType extends Instance<typeof DQNode> {}
export interface DQNodeSnapshot extends SnapshotIn<typeof DQNode> {}
