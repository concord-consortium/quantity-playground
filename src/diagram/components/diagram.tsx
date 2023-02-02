import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import ReactFlow, { Edge, Elements, OnConnectFunc, isEdge,
  OnEdgeUpdateFunc, MiniMap, Controls, ReactFlowProvider, FlowTransform, OnConnectStartFunc, OnConnectEndFunc } from "react-flow-renderer/nocss";

import { DQRootType } from "../models/dq-root";
import { QuantityNode } from "./quantity-node";
import { FloatingEdge } from "./floating-edge";
import { ToolBar } from "./toolbar";
import { DiagramHelper } from "../utils/diagram-helper";
import { ConnectionLine } from "./connection-line";
import { MarkerEnd } from "./marker-end";

// We use the nocss version of RF so we can manually load
// the CSS. This way we can override it.
// Otherwise RF injects its CSS after our CSS, so we can't
// override it.
import "react-flow-renderer/dist/style.css";
import "react-flow-renderer/dist/theme-default.css";

// The order matters the diagram css overrides some styles
// from the react-flow css.
import "./diagram.scss";

const nodeTypes = {
  quantityNode: QuantityNode,
};
const edgeTypes = {
  floatingEdge: FloatingEdge,
};

export interface IProps {
  dqRoot: DQRootType;
  hideControls?: boolean;
  hideNavigator?: boolean;
  hideNewVariableButton?: boolean;
  interactionLocked?: boolean;
  setDiagramHelper?: (dh: DiagramHelper) => void;
  showDeleteCardButton?: boolean;
  showEditVariableDialog?: () => void;
  showNestedSet?: boolean;
  showUnusedVariableDialog?: () => void;
  getDiagramExport?: () => unknown;
}
export const _Diagram = ({ dqRoot, getDiagramExport, hideControls, hideNavigator, hideNewVariableButton, interactionLocked,
  setDiagramHelper, showDeleteCardButton, showEditVariableDialog, showUnusedVariableDialog }: IProps) => 
{
  const reactFlowWrapper = useRef<any>(null);
  const [rfInstance, setRfInstance] = useState<any>();

  const handleChangeFlowTransform = (transform?: FlowTransform) => {
    transform && dqRoot.setTransform(transform);
  };

  const onConnectStart: OnConnectStartFunc = (event, { nodeId, handleType }) => {
    if (!nodeId) {
      return;
    }
    const node = dqRoot.getNodeFromVariableId(nodeId);
    dqRoot.setConnectingVariable(node.variable);
  };
  const onConnectEnd: OnConnectEndFunc = () => {
    dqRoot.setConnectingVariable(undefined);
  };

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate: OnEdgeUpdateFunc = (oldEdge, newConnection) => {
    // We could try to be smart about this, and only update things that
    // changed but it is easier to just break the old connection
    // and make a new one
    const oldTargetNode = dqRoot.getNodeFromVariableId(oldEdge.target);
    const oldSourceNode = dqRoot.getNodeFromVariableId(oldEdge.source);
    oldTargetNode?.removeInput(oldSourceNode.variable);
    const { source, target } = newConnection;
    const newSourceNode = source ? dqRoot.getNodeFromVariableId(source) : undefined;
    const newTargetNode = target ? dqRoot.getNodeFromVariableId(target) : undefined;
    newTargetNode?.addInput(newSourceNode);
  };

  const onConnect: OnConnectFunc = (params) => {
    const { source, target, targetHandle } = params;
    console.log(`connection source: ${source} to target: ${target} on handle: ${targetHandle}`);
    if ( source && target ) {
      const targetModel = dqRoot.getNodeFromVariableId(target);
      const sourceModel = dqRoot.getNodeFromVariableId(source);
      targetModel?.addInput(sourceModel);
    }
  };

  const deleteEdge = (edge: Edge) => {
    const { source, target } = edge;
    const targetModel = dqRoot.getNodeFromVariableId(target);
    const sourceModel = dqRoot.getNodeFromVariableId(source);
    sourceModel?.tryVariable && targetModel?.removeInput(sourceModel.variable);
  };

  const deleteAllEdgesOfNode = (variableId: string) => {
    const nodesEdges = dqRoot.reactFlowElements.filter((e) => {
      return isEdge(e) && (e.source === variableId || e.target === variableId);
    });
    for (const edge of nodesEdges as Edge[]) {
      deleteEdge(edge);
    }
  };

  // onElementsRemove is called when the user's keyboard Delete key is pressed
  // to delete a selected card or a selected connecting arrow (aka "edge").
  const onElementsRemove = (elementsToRemove: Elements) => {
    for (const element of elementsToRemove) {
      if (isEdge((element as any))) {
        const edge = element as Edge;
        deleteEdge(edge);
      } else {
        const nodeToRemove = dqRoot.getNodeFromVariableId(element.id);
        deleteAllEdgesOfNode(element.id);
        dqRoot.removeNode(nodeToRemove);
      }
    }
  };

  // deleteCard is called when the UI's Delete Card button is clicked to
  // delete a selected card.
  const deleteCard = showDeleteCardButton
  ? () => {
    const selectedNode = dqRoot.selectedNode;
    if (selectedNode) {
      deleteAllEdgesOfNode(selectedNode.variable.id);
      dqRoot.removeNode(selectedNode);
    }
  }
  : undefined;

  const onSelectionChange = (selectedElements: Elements | null) => {
    if (selectedElements?.[0]?.type === "quantityNode" ) {
      dqRoot.setSelectedNode(dqRoot.getNodeFromVariableId(selectedElements[0].id));
    } else {
      dqRoot.setSelectedNode(undefined);
    }
  };

  const onLoad = (_rfInstance: any) => {
    setRfInstance(_rfInstance);
    if (setDiagramHelper) {
      const dh = new DiagramHelper(reactFlowWrapper, _rfInstance);
      setDiagramHelper(dh);
    }
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: any) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !rfInstance) {
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const rawPosition = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };
    const position = rfInstance.project(rawPosition);

    dqRoot.createNode({
      x: position.x,
      y: position.y
    });
  };

  const onNodeDrag = (event: React.MouseEvent<Element, MouseEvent>, node: any) => {
    event.stopPropagation();
  };

  // Keep the MST node model in sync with the diagram
  const onNodeDragStop = (event: any, node: any) => {
    const mstNode = dqRoot.getNodeFromVariableId(node.id);
    mstNode?.updatePosition(node.position.x, node.position.y);
    event.stopPropagation();
  };

  const { zoom: defaultZoom, x, y } = dqRoot.flowTransform || {};
  const defaultPosition: [number, number] | undefined = x != null && y != null ? [x, y] : undefined;

  const interactive = !interactionLocked;

  return (
    <div className="diagram" ref={reactFlowWrapper} data-testid="diagram">
      <ReactFlowProvider>
        <svg>
          <defs>
            {/* These custom arrowheads are used to change the connecting line/edge arrowhead
                color as needed. See default.scss for usage. If we upgrade to a newer version
                of React Flow, there may be a cleaner way to change the arrow colors. */}
            <MarkerEnd markerId="custom-arrow" markerColor="#949494" />
            <MarkerEnd markerId="custom-arrow__selected-or-used" markerColor="#5a5a5a" />
            <MarkerEnd markerId="custom-arrow__dragging" markerColor="#0081ff" />
          </defs>
        </svg>
        <ReactFlow
          connectionLineComponent={ConnectionLine}
          elements={dqRoot.reactFlowElements}
          defaultPosition={defaultPosition}
          defaultZoom={defaultZoom}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect as any}  // TODO: fix types
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onElementsRemove={onElementsRemove}
          onSelectionChange={onSelectionChange}
          onLoad={onLoad}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={handleChangeFlowTransform}
          nodesDraggable={interactive}
          nodesConnectable={interactive}
          elementsSelectable={interactive}
          selectNodesOnDrag={interactive}
        >
          {!hideNavigator && <MiniMap/>}
          {!hideControls && <Controls />}
          <ToolBar {...{deleteCard, dqRoot, getDiagramExport, hideNewVariableButton, showEditVariableDialog, showUnusedVariableDialog}}/>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export const Diagram = observer(_Diagram);
Diagram.displayName = "Diagram";
