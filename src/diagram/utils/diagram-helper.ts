import { kDefaultNodeWidth, kDefaultNodeHeight } from "../models/dq-node";

// A class to give clients access to functions that modify or access private information from a diagram
export class DiagramHelper {
  reactFlowWrapper: any;
  rfInstance: any;

  constructor(_reactFlowWrapper: any, _rfInstance: any) {
    this.reactFlowWrapper = _reactFlowWrapper;
    this.rfInstance = _rfInstance;
  }

  fitView() {
    this.rfInstance.fitView();
  }

  zoomIn() {
    this.rfInstance.zoomIn();
  }

  zoomOut() {
    this.rfInstance.zoomOut();
  }

  convertClientToDiagramPosition({x, y}: {x: number, y: number}) {
    if (this.reactFlowWrapper?.current && this.rfInstance) {
      const reactFlowBounds = this.reactFlowWrapper.current.getBoundingClientRect();
      const rawPosition = {
        x: x - reactFlowBounds.left,
        y: y - reactFlowBounds.top
      };
      return this.rfInstance.project(rawPosition);
    }
    console.warn("Unable to convert point from client to diagram position");
    return {x, y};
  }

  get newCardPosition() {
    if (this.reactFlowWrapper?.current && this.rfInstance) {
      const reactFlowBounds = this.reactFlowWrapper.current.getBoundingClientRect();
      const rawPosition = {
        x: (reactFlowBounds.width - kDefaultNodeWidth) / 2,
        y: (reactFlowBounds.height - kDefaultNodeHeight) / 2
      };
      return this.rfInstance.project(rawPosition);
    }
    console.warn("Unable to convert point from client to diagram position");
    return undefined;
  }
}

// export interface DiagramHelperType extends Instance<typeof DiagramHelper> {}
