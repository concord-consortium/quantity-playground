import { kDefaultNodeWidth, kDefaultNodeHeight } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";

// A class to give clients access to functions that modify or access private information from a diagram
export class DiagramHelper {
  reactFlowWrapper: any;
  rfInstance: any;
  dqRoot: DQRootType;

  constructor(_reactFlowWrapper: any, _rfInstance: any, _dqRoot: DQRootType) {
    this.reactFlowWrapper = _reactFlowWrapper;
    this.rfInstance = _rfInstance;
    this.dqRoot = _dqRoot;
  }

  // TODO Zoom in and zoom out are not properly saving changes to the dqRoot
  changeView(func: () => void) {
    func();
    const newView = this.rfInstance.getViewport();
    this.dqRoot.setTransform(newView);
    return newView;
  }

  fitView() {
    return this.changeView(this.rfInstance.fitView);
  }

  zoomIn() {
    return this.changeView(this.rfInstance.zoomIn);
  }

  zoomOut() {
    return this.changeView(this.rfInstance.zoomOut);
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
