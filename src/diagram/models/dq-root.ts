import { Instance, types } from "mobx-state-tree";
import { Elements, FlowTransform } from "react-flow-renderer/nocss";
import { DQNode, DQNodeType } from "./dq-node";
import { VariableType } from "./variable";

export interface VariablesAPI {
  createVariable: () => VariableType;
  removeVariable: (variable?: VariableType) => void;
}

export const DQRoot = types.model("DQRoot", {
  nodes: types.map(DQNode),
  flowTransform: types.maybe(types.frozen<FlowTransform>())
})
.volatile(self => ({
  variablesAPI: undefined as VariablesAPI | undefined,
  connectingVariable: undefined as VariableType | undefined
}))
.views(self => ({
  get reactFlowElements() {
    const elements: Elements = [];
    self.nodes.forEach((node) => {
      elements.push(...node.getReactFlowElements(self));
    });
    return elements;
  },
  get nodeFromVariableMap() {
    const map: Record<string, DQNodeType> = {};
    self.nodes.forEach((node) => {
      map[node.variableId] = node;
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
  addNode(newNode: DQNodeType) {
    self.nodes.put(newNode);
  },
  removeNode(node: DQNodeType) {
    const variables = self.variablesAPI;
    if (!variables) {
      throw new Error("Need variables before deleting nodes");
    }

    variables.removeVariable(node.variable);
  },
  setTransform(transform: FlowTransform) {
    self.flowTransform = transform;
  }
}))
.actions(self => ({
  createNode({x,y}: {x:number, y:number}) {
    const variables = self.variablesAPI;
    if (!variables) {
      throw new Error("Need variables before creating nodes");
    }
    const variable = variables.createVariable();
    const node = DQNode.create({variable: variable.id, x, y});
    self.addNode(node);
  },

  setVariablesAPI(variablesAPI: VariablesAPI) {
    self.variablesAPI = variablesAPI;
  },
  setConnectingVariable(variable?: VariableType) {
    self.connectingVariable = variable;
  }
}));
export interface DQRootType extends Instance<typeof DQRoot> {}
