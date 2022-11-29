import { Instance, types } from "mobx-state-tree";
import { kDefaultNodeWidth, kDefaultNodeHeight } from "./dq-node";

// A model to give clients access to functions that modify or access private information from a diagram
export const DiagramHelper = types.model("DiagramHelper", {
})
.volatile(self => ({
  rfInstance: undefined as any,
  reactFlowWrapper: undefined as any
}))
.actions(self => ({
  setRfInstance(_rfInstance: any) {
    self.rfInstance = _rfInstance;
  },
  setReactFlowWrapper(_reactFlowWrapper: any) {
    self.reactFlowWrapper = _reactFlowWrapper;
  }
}))
.actions(self => ({
  zoomIn() {
    self.rfInstance?.zoomIn();
  },
  zoomOut() {
    self.rfInstance?.zoomOut();
  },
  fitView() {
    self.rfInstance?.fitView();
  }
}))
.views(self => ({
  convertClientToDiagramPosition({x, y}: {x: number, y: number}) {
    if (self.reactFlowWrapper?.current && self.rfInstance) {
      const reactFlowBounds = self.reactFlowWrapper.current.getBoundingClientRect();
      const rawPosition = {
        x: x - reactFlowBounds.left,
        y: y - reactFlowBounds.top
      };
      return self.rfInstance.project(rawPosition);
    }
    console.warn("Unable to convert point from client to diagram position");
    return {x, y};
  },
  get newCardPosition() {
    if (self.reactFlowWrapper?.current && self.rfInstance) {
      const reactFlowBounds = self.reactFlowWrapper.current.getBoundingClientRect();
      const rawPosition = {
        x: (reactFlowBounds.width - kDefaultNodeWidth) / 2,
        y: (reactFlowBounds.height - kDefaultNodeHeight) / 2
      };
      return self.rfInstance.project(rawPosition);
    }
    console.warn("Unable to convert point from client to diagram position");
    return undefined;
  }
}));
export interface DiagramHelperType extends Instance<typeof DiagramHelper> {}
