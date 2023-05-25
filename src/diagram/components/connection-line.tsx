import React from "react";
import { ConnectionLineComponent, ConnectionLineComponentProps } from "reactflow";

export const ConnectionLine: ConnectionLineComponent = ({ fromX, fromY, toX, toY, ...rest }: ConnectionLineComponentProps) =>  {
  console.log(`connecstionLine`, {fromX, fromY, toX, toY, rest});
  return (
    <g className="react-flow__connection">
      <path
        className="react-flow__connection-path"
        data-testid="connection-line"
        fill="none"
        stroke="#0081ff"
        strokeWidth={2}
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
    </g>
  );
};
