import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Controls, Edge, MiniMap, OnConnectEnd, OnConnectStart,
  OnEdgeUpdateFunc, OnNodesDelete, ReactFlowProvider, Viewport
} from "reactflow";

import { DQRootType } from "../models/dq-root";
import { DQNodeType } from "../models/dq-node";
import { QuantityNode } from "./quantity-node";
import { FloatingEdge } from "./floating-edge";
import { ToolBar } from "./toolbar";
import { DiagramHelper } from "../utils/diagram-helper";
import { ConnectionLine } from "./connection-line";
import { MarkerEnd } from "./marker-end";

// These imports seem necessary so we can override default reactflow css.
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";

// The order matters!
// The diagram css overrides some styles from the react-flow css.
import "./diagram.scss";
import "./quantity-node.scss";
import "./floating-edge.scss";

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
  preventKeyboardDelete?: boolean;
  setDiagramHelper?: (dh: DiagramHelper) => void;
  showDeleteCardButton?: boolean;
  showEditVariableDialog?: () => void;
  showNestedSet?: boolean;
  showUnusedVariableDialog?: () => void;
  getDiagramExport?: () => unknown;
}
export const _Diagram = ({ dqRoot, getDiagramExport, hideControls, hideNavigator,
  hideNewVariableButton, interactionLocked, preventKeyboardDelete, setDiagramHelper, showDeleteCardButton,
  showEditVariableDialog, showUnusedVariableDialog }: IProps) => 
{
  const reactFlowWrapper = useRef<any>(null);
  const [rfInstance, setRfInstance] = useState<any>();

  const interactive = !interactionLocked;

  const handleViewportChange = (event: MouseEvent | TouchEvent, viewport: Viewport) => {
    dqRoot.setTransform(viewport);
  };

  const onConnectStart: OnConnectStart = useCallback((event, { nodeId, handleType }) => {
    if (!nodeId) {
      return;
    }
    const node = dqRoot.getNodeFromVariableId(nodeId);
    dqRoot.setConnectingVariable(node.variable);
  }, [dqRoot]);
  const onConnectEnd: OnConnectEnd = useCallback(() => {
    dqRoot.setConnectingVariable(undefined);
  }, [dqRoot]);

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

  const onConnect = (connection: any) => {
    const { source, target } = connection;
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
    const nodesEdges = dqRoot.reactFlowEdges.filter((e: Edge) => {
      return e.source === variableId || e.target === variableId;
    });
    for (const edge of nodesEdges as Edge[]) {
      deleteEdge(edge);
    }
  };

  const deleteNode = (node: DQNodeType) => {
    deleteAllEdgesOfNode(node.variable.id);
    dqRoot.removeNode(node);
  };

  // deleteCard is called when the UI's Delete Card button is clicked to
  // delete a selected card. It is not called when the user's keyboard Delete
  // key is pressed.
  const deleteCard = showDeleteCardButton
  ? () => {
    const selectedNode = dqRoot.selectedNode;
    if (selectedNode) {
      deleteNode(selectedNode);
    }
  }
  : undefined;

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
    // Set the node's model's drag position
    const mstNode = dqRoot.getNodeFromVariableId(node.id);
    mstNode?.updateDragPosition(node.position.x, node.position.y);

    dqRoot.setSelectedNode(node.data.node);

    event.stopPropagation();
  };

  // Keep the MST node model in sync with the diagram
  const onNodeDragStop = (event: any, node: any) => {
    const mstNode = dqRoot.getNodeFromVariableId(node.id);
    mstNode?.updatePosition(node.position.x, node.position.y);
    // Clear the node's model's drag position
    mstNode?.updateDragPosition();

    event.stopPropagation();
  };

  const onNodesDelete: OnNodesDelete = nodes => {
    if (!preventKeyboardDelete) {
      nodes.forEach(node => {
        if (node.id === dqRoot.selectedNode?.variable.id) {
          deleteNode(node.data.node);
        }
      });
    }
  };

  const onEdgesDelete = (edges: Edge[]) => {
    if (!preventKeyboardDelete) {
      edges.forEach(edge => {
        const edgeModel = dqRoot.reactFlowEdges.find((e: Edge) => e.id === edge.id);
        if (edgeModel?.id === dqRoot.selectedEdgeId) {
          deleteEdge(edge);
        }
      });
    }
  };

  const onPaneClick = (event: React.MouseEvent<Element, MouseEvent>) => {
    dqRoot.setSelectedNode();
  };

  const { x, y, zoom } = dqRoot.flowTransform || { x: 0, y: 0, zoom: 1 };
  const defaultViewport: Viewport = { x, y, zoom };

  return (
    <div className="diagram" ref={reactFlowWrapper} data-testid="diagram">
      <ReactFlowProvider>
        <ReactFlow
          connectionLineComponent={ConnectionLine}
          nodes={dqRoot.reactFlowNodes}
          edges={dqRoot.reactFlowEdges}
          defaultViewport={defaultViewport}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onInit={onLoad}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={handleViewportChange}
          onPaneClick={onPaneClick}
          nodesDraggable={interactive}
          nodesConnectable={interactive}
          elementsSelectable={interactive}
          selectNodesOnDrag={interactive}
          attributionPosition="bottom-left"
        >
          {!hideNavigator && <MiniMap/>}
          {!hideControls && <Controls />}
          <ToolBar {...{deleteCard, dqRoot, getDiagramExport, hideNewVariableButton, showEditVariableDialog, showUnusedVariableDialog}}/>
        </ReactFlow>
      </ReactFlowProvider>
      <svg className="def-container">
        <defs>
          {/* These custom arrowheads are used to change the connecting line/edge arrowhead
              color as needed. See default.scss for usage. If we upgrade to a newer version
              of React Flow, there may be a cleaner way to change the arrow colors. */}
          <MarkerEnd markerId="custom-arrow" markerColor="#949494" />
          <MarkerEnd markerId="custom-arrow__selected-or-used" markerColor="#5a5a5a" />
          <MarkerEnd markerId="custom-arrow__dragging" markerColor="#0081ff" />
        </defs>
      </svg>
    </div>
  );
};

export const Diagram = observer(_Diagram);
Diagram.displayName = "Diagram";
