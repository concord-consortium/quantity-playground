import { Instance, types, destroy } from "mobx-state-tree";
import { Elements, FlowTransform } from "react-flow-renderer/nocss";
import { DQNode, DQNodeType } from "./dq-node";
import { Variables } from "./variables";

export const DQRoot = types.model("DQRoot", {
  nodes: types.map(DQNode),
  variables: types.reference(Variables),
  flowTransform: types.maybe(types.frozen<FlowTransform>())
})
.views(self => ({
  get reactFlowElements() {
    const elements: Elements = [];
    self.nodes.forEach((node) => {
      elements.push(...node.reactFlowElements);
    });
    return elements;
  },
  get nodeFromVariableMap() {
    const map: Record<string, DQNodeType> = {};
    self.nodes.forEach((node) => {
      map[node.variable.id] = node;
    });
    return map;
  }
}))
.views(self => ({
  getNodeFromVariableId(id: string) {
    return self.nodeFromVariableMap[id];
  }
}))
.actions(self => ({
  addNode(newNode: Instance<typeof DQNode>) {
    self.nodes.put(newNode);
  },
  removeNodeById(nodeId: string) {
    const nodeToRemove = self.nodes.get(nodeId);
    // self.nodes.delete(nodeId);
    destroy(nodeToRemove);
  },
  setTransform(transform: FlowTransform) {
    self.flowTransform = transform;
  }
}))
.actions(self => ({
  createNode({x,y}: {x:number, y:number}) {
    const variable = self.variables.createVariable();
    const node = DQNode.create({variable: variable.id, x, y});
    self.addNode(node);
  }
}));
export interface DQRootType extends Instance<typeof DQRoot> {}
