import React from "react";
import { ConnectionLineType, getBezierPath, Position } from "reactflow";

import { render, screen } from "@testing-library/react";
import { ConnectionLine } from "./connection-line";

const sourceX = 0;
const sourceY = 0;
const targetX = 100;
const targetY = 100;
const dValue = getBezierPath({ sourceX, sourceY, sourcePosition: Position.Right, targetX, targetY, targetPosition: Position.Left })[0];

describe("ConnectionLine", () => {
  it ("renders an SVG path to use as a connecting line between nodes", () => {
    render(
      <ConnectionLine
        fromX={sourceX} fromY={sourceY}
        toX={targetX} toY={targetY}
        connectionLineStyle={{}}
        fromPosition={Position.Right}
        toPosition={Position.Left}
        connectionLineType={ConnectionLineType.Bezier}
        connectionStatus="valid"
      />
    );
    expect(screen.getByTestId("connection-line")).toBeInTheDocument();
    expect(screen.getByTestId("connection-line")).toHaveAttribute("d", dValue);
  });
});
