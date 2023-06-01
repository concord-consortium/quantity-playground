import React from "react";
import { ConnectionLineComponent, ConnectionLineComponentProps } from "reactflow";

import { selectedBlue } from "../utils/theme-utils";

export const ConnectionLine: ConnectionLineComponent = ({ fromX, fromY, toX, toY, ...rest }: ConnectionLineComponentProps) =>  {
  return (
    <g className="react-flow__connection">
      <path
        className="react-flow__connection-path"
        data-testid="connection-line"
        fill="none"
        stroke={selectedBlue}
        strokeWidth={2}
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
    </g>
  );
};
