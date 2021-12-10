import { Instance, types, destroy, getSnapshot } from "mobx-state-tree";
import { Elements, isNode, OnLoadParams } from "react-flow-renderer/nocss";
import { DQNode } from "./dq-node";

export const DQRoot = types.model("DQRoot", {
    nodes: types.map(DQNode)
})
.volatile(self => ({
    rfInstance: undefined as OnLoadParams | undefined
}))
.views(self => ({
    get reactFlowElements() {
        const elements: Elements = [];
        self.nodes.forEach((node) => {
            elements.push(...node.reactFlowElements);
        });
        return elements;
    },
    // NOTE: this is not reactive, so components accessing it won't be re-rendered
    // automatically if the value changes
    getDiagramState() {
        const currentSnapshot = getSnapshot(self);
        const currentModel = JSON.parse(JSON.stringify(currentSnapshot));
        const currentDiagram = self.rfInstance?.toObject();
        if (!currentDiagram) {
          return;
        }
        for(const node of currentDiagram.elements) {
          if (isNode(node)) {
            const modelNode = currentModel.nodes[node.id];
            modelNode.x = node.position.x;
            modelNode.y = node.position.y;
          }
        }
        console.log("Exported Diagram", currentModel);
        return currentModel;
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
    setRfInstance(rfInstance: OnLoadParams) {
        self.rfInstance = rfInstance;
    }
}));

// Seems like the way this should work is with references instead of
// containment.
// Then there will be a top level container that has an array of all of
// the nodes.

// To draw this we'd probably want additional models to hold the
// location of the node.
// Our 2 known options for drawing the nodes are:
// - rete
// - jsPlumb
//
// https://reactflow.dev/docs/getting-started/
// this looks like a good library to me here is how i think it could be
// used:
//  it is provided an initial state
//  it has call backs for adding, removing, and connecting elements
//  we use the call backs to make changes in the MST models
//  then take a snapshot of the model and possibly transform it
//  (assuming we can't match the model to the element format)
//  we'd need to augment the snapshot with computed properties, so
//  maybe a basic snapshot isn't good and we just need to traverse the
//  tree building the output manually.  Or possible we can create
//  custom node types which can take the MST model for the node
//  directly. So then when new nodes are added or removed it will
//  trigger a re-render. 
