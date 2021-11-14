import React, { useState } from "react";
import ReactFlow, { addEdge, ArrowHeadType, Elements, OnConnectFunc, OnEdgeUpdateFunc, updateEdge } from "react-flow-renderer";
import { DQNodeList } from "../models/dq-models";
import { QuantityNode } from "./quantity-node";

const nodes = DQNodeList.create({
  nodes: {
      "1": {
          id: "1",
          value: 124          
      },
      "2": {
          id: "2",
          previous: "1"
      },
      "3": {
        id: "3",
    }
  }
});

const initialElements: Elements = [
  {
    id: "1",
    type: "quantityNode", 
    data: { node:  nodes.nodes.get("1") },
    position: { x: 100, y: 100 },
  },
  {
    id: "2",
    type: "quantityNode", 
    data: { node:  nodes.nodes.get("2") },
    position: { x: 250, y: 50 },
  },
  {
    id: "3",
    type: "quantityNode", 
    data: { node:  nodes.nodes.get("3") },
    position: { x: 250, y: 150 },
  },
  { id: "e1-2", source: "1", target: "2", arrowHeadType: ArrowHeadType.Arrow },
];

const nodeTypes = {
  quantityNode: QuantityNode,
};

export const Diagram = () => {
  const [elements, setElements] = useState(initialElements);

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate: OnEdgeUpdateFunc = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  const onConnect: OnConnectFunc = (params) => {
    const { source, target } = params;
    if ( source && target ) {
      const targetModel = nodes.nodes.get(target);
      targetModel?.setPrevious(nodes.nodes.get(source));
    }
    setElements((els) => addEdge(params, els));
  };

  return (
    <div style={{ height: 600, width: 800 }}>
        <ReactFlow elements={elements} 
        nodeTypes={nodeTypes} 
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}/>
    </div>
  );
};
