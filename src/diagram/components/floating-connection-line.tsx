import { observer } from "mobx-react-lite";
import React from "react";
import { ConnectionLineType, getBezierPath, HandleElement, Position } from "react-flow-renderer";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";
import { DQNodeType } from "../models/dq-node";

interface IProps {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
  connectionLineType: ConnectionLineType;
  sourceNode?: DQNodeType;
  sourceHandle?: HandleElement;
}

const _FloatingConnectionLine: React.FC<IProps> =
  ({ sourceX, sourceY, sourcePosition, targetX, targetY,
    targetPosition, sourceNode }) => {
  console.log("sourceNode:", sourceNode, targetX, targetY);
  if (!sourceNode) {
    return null;
  }

  const targetNode = {
    id: "connection-target",
    width: 1,
    height: 1,
    x: targetX,
    y: targetY,
    // width: 1, height: 1, position: { x: targetX, y: targetY },
  };

  const { sx, sy } = getEdgeParams(sourceNode, targetNode);
  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} className="animated" d={d} />
      <circle cx={targetX} cy={targetY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export const FloatingConnectionLine = observer(_FloatingConnectionLine);
FloatingConnectionLine.displayName = "FloatingConnectionLine";

