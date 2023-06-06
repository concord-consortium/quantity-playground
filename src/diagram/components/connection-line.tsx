import React from "react";
import { ConnectionLineComponent, ConnectionLineComponentProps, getBezierPath, Position } from "reactflow";

import { Arrowhead } from "./arrowhead";
import { selectedBlue } from "../utils/theme-utils";

export const ConnectionLine: ConnectionLineComponent = ({ fromX, fromY, toX, toY, ...rest }: ConnectionLineComponentProps) =>  {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const targetPosition = Math.abs(dx) >= Math.abs(dy)
    ? dx >= 0 ? Position.Left : Position.Right
    : dy >= 0 ? Position.Top : Position.Bottom;
  const d = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: Position.Right,
    targetPosition,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g className="react-flow__connection">
      <path
        className="react-flow__connection-path"
        data-testid="connection-line"
        fill="none"
        stroke={selectedBlue}
        strokeWidth={2}
        d={d[0]}
      />
      <Arrowhead targetPosition={targetPosition} targetX={toX} targetY={toY} />
    </g>
  );
};
