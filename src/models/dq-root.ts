import { Instance, types, destroy } from "mobx-state-tree";
import { Elements, FlowTransform } from "react-flow-renderer/nocss";
import { DQNode } from "./dq-node";

export const DQRoot = types.model("DQRoot", {
    nodes: types.map(DQNode),
    flowTransform: types.maybe(types.frozen<FlowTransform>())
})
.views(self => ({
    get reactFlowElements() {
        const elements: Elements = [];
        self.nodes.forEach((node) => {
            elements.push(...node.reactFlowElements);
        });
        return elements;
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
}));
export interface DQRootType extends Instance<typeof DQRoot> {}
