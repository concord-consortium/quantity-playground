import { Instance, types } from "mobx-state-tree";
import { Elements, FlowTransform } from "react-flow-renderer/nocss";
import { DQNode, DQNodeType } from "./dq-node";
import { VariableType } from "./variable";

export interface VariablesAPI {
  createVariable: () => VariableType;
  removeVariable: (variable?: VariableType) => void;
  getVariables: () => VariableType[];
}

export const DQRoot = types.model("DQRoot", {
  nodes: types.map(DQNode),
  flowTransform: types.maybe(types.frozen<FlowTransform>())
})
.volatile(self => ({
  variablesAPI: undefined as VariablesAPI | undefined,
  connectingVariable: undefined as VariableType | undefined,
  selectedNode: undefined as DQNodeType | undefined
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
  },
  get variables() {
    const variables: VariableType[] = [];
    self.nodes.forEach(node => variables.push(node.variable));
    return variables;
  }
}))
.views(self => ({
  get unusedVariables() {
    const variables = self.variablesAPI?.getVariables();
    const unusedVariables: VariableType[] = [];
    variables?.forEach(variable => {
      if (!self.variables.includes(variable)) {
        unusedVariables.push(variable);
      }
    });
    return unusedVariables;
  },
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

    if (self.selectedNode === node) {
      self.selectedNode = undefined;
    }
    self.nodes.delete(node.id);
  },
  setTransform(transform: FlowTransform) {
    self.flowTransform = transform;
  },
  setSelectedNode(node?: DQNodeType) {
    self.selectedNode = node;
  }
}))
.actions(self => ({
  insertNode(variable: VariableType, {x,y}: {x: number, y: number}) {
    const node = DQNode.create({ variable: variable.id, x, y});
    self.addNode(node);
  }
}))
.actions(self => ({
  createNode({x,y}: {x:number, y:number}) {
    const variables = self.variablesAPI;
    if (!variables) {
      throw new Error("Need variables before creating nodes");
    }
    const variable = variables.createVariable();
    self.insertNode(variable, {x, y});
  },

  setVariablesAPI(variablesAPI: VariablesAPI) {
    self.variablesAPI = variablesAPI;
  },
  setConnectingVariable(variable?: VariableType) {
    self.connectingVariable = variable;
  }
}));
export interface DQRootType extends Instance<typeof DQRoot> {}
