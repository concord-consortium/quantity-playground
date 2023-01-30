import React from "react";

interface IProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export const ConnectionLine: React.FC<IProps> = ({ sourceX, sourceY, targetX, targetY }) =>  {
  return (
    <g className="react-flow__connection disconnected">
      <path
        className="react-flow__edge-path react-flow__edgeupdater disconnected"
        data-testid="connection-line"
        fill="none"
        stroke="#0081ff"
        strokeWidth={2}
        d={`M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`}
      />
    </g>
  );
};
