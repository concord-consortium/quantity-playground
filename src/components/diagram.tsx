import React from "react";
import ReactFlow from "react-flow-renderer";
import { QuantityNode } from "./quantity-node";

const elements = [
  {
    id: "1",
    type: "input", // input node
    data: { label: "Input Node" },
    position: { x: 250, y: 25 },
  },
  // default node
  {
    id: "2",
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
  },
  {
    id: "3",
    type: "output", // output node
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
  },
  {
    id: "4",
    type: "quantityNode",
    position: { x: 100, y: 250 },
    data: { color: "#1A192B" }
  },
  // animated edge
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e4-3", source: "4", target: "3", sourceHandle: "b" }
];

const nodeTypes = {
  quantityNode: QuantityNode,
};

export const Diagram = () => (
  <div style={{ height: 300, width: 600 }}>
    <ReactFlow elements={elements} 
      nodeTypes={nodeTypes} />
  </div>
);
