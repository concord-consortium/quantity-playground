import { getSnapshot, IAnyComplexType, Instance, SnapshotIn, tryReference, types } from "mobx-state-tree";
import { nanoid } from "nanoid";
import { Edge, Node, MarkerType } from "reactflow";
import { Variable, VariableType } from "./variable";

// Make sure to update corresponding variables in components/quantity-node.scss when you change these constants.
export const kDefaultNodeWidth = 194;
export const kDefaultNodeHeight = 98;
export const kDefaultNodeRowHeight = 26;

export const kExpandedNotesHeight = 67;

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
.volatile(self => ({
  dragX: undefined as number | undefined,
  dragY: undefined as number | undefined
}))
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
  get position() {
    // Uses the volatile dragX and dragY while the node is being dragged
    return {
      x: self.dragX ?? self.x,
      y: self.dragY ?? self.y
    };
  }
}))
.views(self => ({
  // Circular reference with dqRoot and dqNode so typing as any
  getReactFlowNodes(dqRoot: any) {
    const nodes: Node[] = [];
    const id = self.variableId;
    nodes.push({
      id,
      type: "quantityNode",
      data: { node: self, dqRoot },
      position: { x: self.position.x, y: self.position.y }
    });
    return nodes;    
  },
  // Circular reference with dqRoot and dqNode so typing as any
  getReactFlowEdges(dqRoot: any) {
    const edges: Edge[] = [];
    const id = self.variableId;
    const variable = self.tryVariable;
    if (variable) {
      const inputs = self.variable.inputs as unknown as VariableType[] | undefined;
      const usedInputs = self.variable.inputsInExpression;
      inputs?.forEach((input) => {
        if (input) {
          const usedInExpression = input.name && usedInputs?.includes(input.name);
          const edgeId = `e${input.id}-target${id}-a`;
          edges.push({
            id: edgeId,
            selected: edgeId === dqRoot.selectedEdgeId,
            source: input.id,
            target: id,
            type: "floatingEdge",
            markerEnd: {
              type: MarkerType.Arrow,
            },
            data: { dqRoot },
            className: usedInExpression ? "used-in-expression" : ""
          });
        }
      });
    }
    return edges;
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
  updateDragPosition(x?: number, y?: number) {
    self.dragX = x;
    self.dragY = y;
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
