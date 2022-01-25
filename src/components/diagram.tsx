import { observer } from "mobx-react-lite";
import { getSnapshot, applySnapshot, onSnapshot, Instance } from "mobx-state-tree";
import React, { useRef, useState } from "react";
import ReactFlow, { Edge, Elements, OnConnectFunc, 
  OnEdgeUpdateFunc, MiniMap, Controls, ReactFlowProvider } from "react-flow-renderer/nocss";
import { DQRoot } from "../models/dq-root";
import { DQNode, Operation } from "../models/dq-node";
import { NodeForm } from "./node-form";
import { QuantityNode } from "./quantity-node";
import { ToolBar } from "./toolbar";
import codapInterface from "../lib/CodapInterface";

// We use the nocss version of RF so we can manually load
// the CSS. This way we can override it.
// Otherwise RF injects its CSS after our CSS, so we can't
// override it. 
import "react-flow-renderer/dist/style.css";
import "react-flow-renderer/dist/theme-default.css";

// The order matters the diagram css overrides some styles
// from the react-flow css.
import "./diagram.scss";
import { NestedSet } from "./nested-set";

const url = new URL(window.location.href);
const showNestedSet = !(url.searchParams.get("nestedSet") == null);

let nextId = 0;

const initializeCodapConnection = () => {
  const codapConfig = {
    customInteractiveStateHandler: true,
    name: "Quantitative Playground",
    version: "1.0"
  };

  codapInterface.on("get", "interactiveState", "",
      () => {return {success: true, values: getSnapshot(dqRoot)};});

  codapInterface.init(codapConfig).then(
    (initialState) => {
      if (initialState?.nodes) {
        // update nextId as it is not saved with the state
        const nodeIds = Object.keys(initialState.nodes);
        const maxId = nodeIds.reduce((m: number, nodeID: string) => Math.max(m, Number(nodeID)), 0);
        nextId = maxId + 1;
        applySnapshot(dqRoot, initialState);
        // when the model changes, notify CODAP that the plugin is 'dirty'
        onSnapshot(dqRoot,() => {
          codapInterface.sendRequest({
            "action": "notify",
            "resource": "interactiveFrame",
            "values": {"dirty": true}
          });
        });
      }
      else {
        codapInterface.sendRequest({
          action: "update",
          resource: "interactiveFrame",
          values: {dimensions: {height: 600, width: 800}}
        });
      }
    },
    (msg: string) => {
      console.warn("No CODAP: " + msg);
    }
  );
};

const loadInitialState = () => {
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

  // Override default diagram with URL param or prior state
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

initializeCodapConnection();

// For debugging
(window as any).dqRoot = dqRoot;
(window as any).getSnapshot = getSnapshot;


const nodeTypes = {
  quantityNode: QuantityNode,
};

export const _Diagram = () => {
  const reactFlowWrapper = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<Instance<typeof DQNode> | undefined>();
  const [rfInstance, setRfInstance] = useState<any>();

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

    const dqNode = DQNode.create({
      id: nextId.toString(),
      x: position.x,
      y: position.y   
    });
    dqRoot.addNode(dqNode);
    nextId++;
  };

  // Keep the MST node model in sync with the diagram
  const onNodeDragStop = (event: any, node: any) => {
    const mstNode = dqRoot.nodes.get(node.id);
    mstNode?.updatePosition(node.position.x, node.position.y);
  };

  return (
    <div className="diagram" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow elements={dqRoot.reactFlowElements} 
          nodeTypes={nodeTypes} 
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
          onSelectionChange={onSelectionChange}
          onLoad={(_rfInstance) => setRfInstance(_rfInstance)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStop={onNodeDragStop}>
          <MiniMap/>
          <Controls />
          { selectedNode && 
            <>
              <NodeForm node={selectedNode}/>
              { showNestedSet &&
                <div style={{zIndex: 4, position: "absolute", left: "300px"}}>
                  <NestedSet node={selectedNode} final={true} />
                </div>
              }
            </> 
          }
          <ToolBar dqRoot={dqRoot}/>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export const Diagram = observer(_Diagram);
Diagram.displayName = "Diagram";
