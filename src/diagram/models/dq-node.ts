import { getSnapshot, IAnyComplexType, Instance, SnapshotIn, tryReference, types } from "mobx-state-tree";
import { nanoid } from "nanoid";
import { ArrowHeadType, Elements } from "react-flow-renderer/nocss";
import { Variable, VariableType } from "./variable";

export const kDefaultNodeWidth = 194;
export const kDefaultNodeHeight = 98;

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
  // Circular reference with dqRoot and dqNode so typing as any
  getReactFlowElements(dqRoot: any) {
    const elements: Elements = [];
    const id = self.variableId;
    elements.push({
      id,
      type: "quantityNode",
      data: { node: self, dqRoot },
      position: { x: self.x, y: self.y },
    });

    const variable = self.tryVariable;
    if (variable) {
      const inputs = self.variable.inputs as unknown as VariableType[] | undefined;
      inputs?.forEach((input) => {
        if (input) {
          elements.push({
            id: `e${input.id}-target${id}-a`,
            source: input.id,
            target: id,
            arrowHeadType: ArrowHeadType.ArrowClosed,
            type: "floatingEdge",
            data: { dqRoot },
          });
        }
      });
    }

    return elements;
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

  addInput(newInput: Instance<IAnyComplexType> | undefined) {
    self.tryVariable?.addInput((newInput as any)?.variable);
  },
  removeInput(input: VariableType) {
    self.tryVariable?.removeInput((input));
  },
}));
export interface DQNodeType extends Instance<typeof DQNode> {}
export interface DQNodeSnapshot extends SnapshotIn<typeof DQNode> {}
