import { observer } from "mobx-react-lite";
import { getSnapshot, Instance } from "mobx-state-tree";
import React, { useState } from "react";
import ReactFlow, { Edge, Elements, OnConnectFunc, 
  OnEdgeUpdateFunc, OnLoadParams, MiniMap, Controls, isNode } from "react-flow-renderer";
import { DQRoot } from "../models/dq-models";
import { DQNode, Operation } from "../models/dq-node";
import { NodeForm } from "./node-form";
import { QuantityNode } from "./quantity-node";

let nextId = 0;
const loadInitialState = () => {
  const url = new URL(window.location.href);
  const urlDiagram = url.searchParams.get("diagram");
  
  // Default diagram
  let diagram = {
    nodes: {
        "1": {
            id: "1",
            value: 124,
            x: 100,
            y: 100       
        },
        "2": {
            id: "2",
            x: 100,
            y: 200
        },
        "3": {
            id: "3",
            inputA: "1",
            inputB: "2",
            operation: Operation.Divide,
            x: 250,
            y: 150
        }
    }
  };

  // Override default diagram with URL param
  if (urlDiagram) {
    diagram = JSON.parse(urlDiagram);
  }

  // Figure out the nextId
  let maxId = 0;
  for (const idString of Object.keys(diagram.nodes)) {
    const id = parseInt(idString, 10);
    if (id > maxId) maxId = id;
  }
  nextId = maxId + 1;
  return diagram;
};

const dqRoot = DQRoot.create(loadInitialState());

// For debugging
(window as any).dqRoot = dqRoot;
(window as any).getSnapshot = getSnapshot;

const nodeTypes = {
  quantityNode: QuantityNode,
};

export const _Diagram = () => {
  const [selectedNode, setSelectedNode] = useState<Instance<typeof DQNode> | undefined>();
  const [rfInstance, setRfInstance] = useState<OnLoadParams>();


  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate: OnEdgeUpdateFunc = (oldEdge, newConnection) => {

    // We could try to be smart about this, and only update things that
    // changed but it is easier to just break the old connection 
    // and make a new one
    const oldTargetNode = dqRoot.nodes.get(oldEdge.target);
    const oldTargetHandle = oldEdge.targetHandle;
    if (oldTargetHandle === "a") {
      oldTargetNode?.setInputA(undefined);
    } else if (oldTargetHandle === "b") {
      oldTargetNode?.setInputB(undefined);
    }
    
    const { source, target, targetHandle: newTargetHandle } = newConnection;
    const newSourceNode = source ? dqRoot.nodes.get(source) : undefined;
    const newTargetNode = target ? dqRoot.nodes.get(target) : undefined;
    if (newTargetHandle === "a") {
      newTargetNode?.setInputA(newSourceNode);
    } else if (newTargetHandle === "b") {
      newTargetNode?.setInputB(newSourceNode);
    }
  };

  const onConnect: OnConnectFunc = (params) => {
    const { source, target, targetHandle } = params;
    console.log(`connection source: ${source} to target: ${target} on handle: ${targetHandle}`);
    if ( source && target ) {
      const targetModel = dqRoot.nodes.get(target);
      const sourceModel = dqRoot.nodes.get(source);
      if (targetHandle === "a") {
        targetModel?.setInputA(sourceModel);
      } else if (targetHandle === "b") {
        targetModel?.setInputB(sourceModel);        
      }
    }
  };

  const onElementsRemove = (elementsToRemove: Elements) => {
    for(const element of elementsToRemove) {
      console.log(element);
      if ((element as any).target) {
        // This is a edge (I think)
        const edge = element as Edge;
        const { target, targetHandle } = edge;
        const targetModel = dqRoot.nodes.get(target);
        if (targetHandle === "a") {
          targetModel?.setInputA(undefined);
        } else if (targetHandle === "b") {
          targetModel?.setInputB(undefined);        
        }
      } else {
        // If this is the selected node we need to remove it from the state too
        const nodeToRemove = dqRoot.nodes.get(element.id);
        setSelectedNode((currentNode) => nodeToRemove === currentNode ? undefined : currentNode);
        dqRoot.removeNodeById(element.id);
      }
    }
  };

  const onSelectionChange = (selectedElements: Elements | null) => {
    if (selectedElements?.[0]?.type === "quantityNode" ) {
      setSelectedNode(dqRoot.nodes.get(selectedElements[0].id));
    } else {
      setSelectedNode(undefined);
    }
  };

  const addNode = () => {
    const dqNode = DQNode.create({
      id: nextId.toString(),
      x: 350,
      y: 150   
    });
    dqRoot.addNode(dqNode);
    nextId++;
  };

  const copyDiagramURL = () => {
    const currentSnapshot = getSnapshot(dqRoot);
    const currentModel = JSON.parse(JSON.stringify(currentSnapshot));
    const currentDiagram = rfInstance?.toObject();
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
    const url = new URL(window.location.href);
    url.searchParams.set("diagram", JSON.stringify(currentModel));
    console.log(url.href);
    navigator.clipboard.writeText(url.href);
  };

  return (
    <div className="diagram">
        <ReactFlow elements={dqRoot.reactFlowElements} 
          nodeTypes={nodeTypes} 
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
          onSelectionChange={onSelectionChange}
          onLoad={setRfInstance}>
          <MiniMap/>
          <Controls />
          { selectedNode && <NodeForm node={selectedNode}/> }
          <div style={{zIndex: 4, position: "absolute", right: 0, top: 0, display: "flex", flexDirection:"column"}} >
            <button className="action" onClick={addNode}>Add Node</button>
            <button className="action" onClick={copyDiagramURL}>Copy Diagram URL</button>
          </div>
        </ReactFlow>
    </div>
  );
};

export const Diagram = observer(_Diagram);
Diagram.displayName = "Diagram";
