import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { viewportsEqual } from "../utils/reactflow-utils";
import { ConnectionLine } from "./connection-line";

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
  readOnly?: boolean;
  setDiagramHelper?: (dh: DiagramHelper) => void;
  showDeleteCardButton?: boolean;
  showEditVariableDialog?: () => void;
  showNestedSet?: boolean;
  showUnusedVariableDialog?: () => void;
  getDiagramExport?: () => unknown;
}
export const _Diagram = ({ dqRoot, getDiagramExport, hideControls, hideNavigator,
  hideNewVariableButton, interactionLocked, preventKeyboardDelete, readOnly, setDiagramHelper, showDeleteCardButton,
  showEditVariableDialog, showUnusedVariableDialog }: IProps) => 
{
  const reactFlowWrapper = useRef<any>(null);
  const [rfInstance, setRfInstance] = useState<any>();

  const interactive = !(interactionLocked || readOnly);

  // Update the viewport when the model's viewport changes (for example, when undoing)
  useEffect(() => {
    const lastViewport = rfInstance?.getViewport();
    const modelViewport = dqRoot.flowTransform;
    if (lastViewport && modelViewport && !viewportsEqual(lastViewport, modelViewport)) {
      rfInstance.setViewport(modelViewport);
    }
  }, [dqRoot.flowTransform, rfInstance]);

  // TODO This is only being called when the user pans, but should be called in other contexts
  // (for example, pinching to zoom)
  const handleViewportChange = (event: MouseEvent | TouchEvent, viewport: Viewport) => {
    const rootViewport = dqRoot.flowTransform as Viewport;
    if (rootViewport && !viewportsEqual(viewport, rootViewport)) {
      dqRoot.setTransform(viewport);
    }
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
    dqRoot.deleteEdge(source, target);
  };

  const deleteNode = (node: DQNodeType) => {
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
      const dh = new DiagramHelper(reactFlowWrapper, _rfInstance, dqRoot);
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

  const rfEdges = dqRoot.reactFlowEdges.map(edge => {
    return { ...edge, data: { ...edge.data, readOnly }};
  });
  const rfNodes = readOnly ? dqRoot.reactFlowNodesReadOnly : dqRoot.reactFlowNodes;
  return (
    <div className="diagram" ref={reactFlowWrapper} data-testid="diagram">
      <ReactFlowProvider>
        <ReactFlow
          attributionPosition="bottom-left"
          autoPanOnNodeDrag={false}
          connectionLineComponent={ConnectionLine}
          defaultViewport={defaultViewport}
          edges={rfEdges}
          edgeTypes={edgeTypes}
          edgesUpdatable={false}
          elementsSelectable={interactive}
          minZoom={.1}
          nodes={rfNodes}
          nodesConnectable={interactive}
          nodesDraggable={interactive}
          nodeTypes={nodeTypes}
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
          panOnDrag={true}
          selectNodesOnDrag={interactive}
          zoomOnDoubleClick={false}
          zoomOnPinch={true}
          zoomOnScroll={false}
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
