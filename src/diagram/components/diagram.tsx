import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import ReactFlow, { Edge, Elements, OnConnectFunc, isEdge,
  OnEdgeUpdateFunc, MiniMap, Controls, ReactFlowProvider, FlowTransform, OnConnectStartFunc, OnConnectEndFunc } from "react-flow-renderer/nocss";
import { DQRootType } from "../models/dq-root";
import { DQNodeType } from "../models/dq-node";
import { QuantityNode } from "./quantity-node";
import { FloatingEdge } from "./floating-edge";
import { ToolBar } from "./toolbar";

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

interface IProps {
  dqRoot: DQRootType;
  showEditVariableDialog?: () => void;
  showNestedSet?: boolean;
  getDiagramExport?: () => unknown;
}
export const _Diagram = ({ dqRoot, getDiagramExport, showEditVariableDialog }: IProps) => {
  const reactFlowWrapper = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<DQNodeType | undefined>();
  const [rfInstance, setRfInstance] = useState<any>();

  // Keep the model's selected node up to date with ReactFlow's
  useEffect(() => {
    dqRoot.setSelectedNode(selectedNode);
  }, [dqRoot, selectedNode]);

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

  const onElementsRemove = (elementsToRemove: Elements) => {
    for(const element of elementsToRemove) {
      if (isEdge((element as any))) {
        const edge = element as Edge;
        const { source, target } = edge;
        const targetModel = dqRoot.getNodeFromVariableId(target);
        const sourceModel = dqRoot.getNodeFromVariableId(source);
        // sourceModel gets removed first when a node is selected to be deleted, otherwise, just remove the connection
        sourceModel.tryVariable && targetModel.removeInput(sourceModel.variable);
      } else {
        // If this is the selected node we need to remove it from the state too
        const nodeToRemove = dqRoot.getNodeFromVariableId(element.id);
        setSelectedNode((currentNode) => nodeToRemove === currentNode ? undefined : currentNode);
        dqRoot.removeNode(nodeToRemove);
      }
    }
  };

  const onSelectionChange = (selectedElements: Elements | null) => {
    if (selectedElements?.[0]?.type === "quantityNode" ) {
      setSelectedNode(dqRoot.getNodeFromVariableId(selectedElements[0].id));
    } else {
      setSelectedNode(undefined);
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
    const position = rfInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

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

  return (
    <div className="diagram" ref={reactFlowWrapper} data-testid="diagram">
      <ReactFlowProvider>
        <ReactFlow
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
          onLoad={(_rfInstance) => setRfInstance(_rfInstance)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={handleChangeFlowTransform}>
          <MiniMap/>
          <Controls />
          <ToolBar {...{dqRoot, getDiagramExport, showEditVariableDialog}}/>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export const Diagram = observer(_Diagram);
Diagram.displayName = "Diagram";
