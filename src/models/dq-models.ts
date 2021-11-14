import { IAnyComplexType, Instance, types } from "mobx-state-tree";

export const InitialNode = types.model({
  nodeType: types.literal("initial"),
  dimension: types.maybe(types.string),
  unit: types.maybe(types.string),
  value: types.maybe(types.number)  
});

export const RelatedNode = types.model({
  nodeType: types.literal("related"),
  node: types.late((): IAnyComplexType => AnyNode),
  unitOverride: types.maybe(types.string)
});

export const OperationNode = types.model({
  nodeType: types.literal("operation"),
  nodeA: types.late((): IAnyComplexType => AnyNode),
  nodeB: types.late((): IAnyComplexType => AnyNode),
  unitOverride: types.maybe(types.string),
  operation: types.string
});

export const AnyNode = types.union(InitialNode, RelatedNode, OperationNode);


export const DQNode = types.model("BasicNode", {
    id: types.identifier,
    value: types.maybe(types.number),
    previous: types.maybe(types.reference(types.late((): IAnyComplexType => DQNode)))
})
.views(self => ({
    get computedValue() {
        if ( self.previous ){
            // use of this is recommended in MST docs for referring to a computed property
            // that is defined in the same views block. 
            // Using self fails because typescript doesn't know about the newly added 
            // property on self.
            return this.previous.computedValue;
        }
        return self.value;
    }
}))
.actions(self => ({
    setPrevious(newPrevious: Instance<IAnyComplexType> | undefined ) {
        self.previous = newPrevious;
    }
}));

export const DQNodeList = types.model("NodeList", {
    nodes: types.map(DQNode)
});

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
