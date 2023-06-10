import { destroy, Instance, isValidReference, types } from "mobx-state-tree";
import { Edge, Node, Viewport } from "reactflow";
import { DQNode, DQNodeType } from "./dq-node";
import { VariableType } from "./variable";

export interface VariablesAPI {
  createVariable: () => VariableType;
  removeVariable: (variable?: VariableType) => void;
  getVariables: () => VariableType[];
}

export const DQRoot = types.model("DQRoot", {
  nodes: types.map(DQNode),
  flowTransform: types.maybe(types.frozen<Viewport>())
})
.volatile(self => ({
  variablesAPI: undefined as VariablesAPI | undefined,
  connectingVariable: undefined as VariableType | undefined,
  selectedNode: undefined as DQNodeType | undefined,
  selectedEdgeId: undefined as string | undefined
}))
.actions(self => ({
  afterCreate() {
    // If any nodes reference non-existent variables, destroy them
    self.nodes.forEach(node => {
      if (!isValidReference(() => node.variable)) {
        console.warn(`Found node with non-existent variable`, node);
        destroy(node);
      }
    });
  }
}))
.views(self => ({
  get reactFlowNodes() {
    const nodes: Node[] = [];
    self.nodes.forEach((node) => {
      nodes.push(...node.getReactFlowNodes(self));
    });
    return nodes;
  },
  get reactFlowEdges() {
    const edges: Edge[] = [];
    self.nodes.forEach((node) => {
      edges.push(...node.getReactFlowEdges(self));
    });
    return edges;
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
    self.nodes.forEach(node => {
      variables.push(node.variable);
    });
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
  deleteEdge(sourceId: string, targetId: string) {
    const sourceModel = self.getNodeFromVariableId(sourceId);
    const targetModel = self.getNodeFromVariableId(targetId);
    sourceModel?.tryVariable && targetModel?.removeInput(sourceModel.variable);
  },
}))
.actions(self => ({
  deleteAllEdgesOfNode(variableId: string) {
    const nodesEdges = self.reactFlowEdges.filter((e: Edge) => {
      return e.source === variableId || e.target === variableId;
    });
    for (const edge of nodesEdges as Edge[]) {
      self.deleteEdge(edge.source, edge.target);
    }
  },
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
    self.deleteAllEdgesOfNode(node.id);
    self.nodes.delete(node.id);
  },
  setTransform(transform: Viewport) {
    self.flowTransform = transform;
  },
  setSelectedNode(node?: DQNodeType) {
    self.selectedNode = node;
    self.selectedEdgeId = undefined;
  },
  setSelectedEdgeId(id?: string) {
    self.selectedEdgeId = id;
    self.selectedNode = undefined;
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
