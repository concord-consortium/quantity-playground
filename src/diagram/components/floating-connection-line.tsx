import { observer } from "mobx-react-lite";
import React from "react";
import { ConnectionLineType, getBezierPath, HandleElement, Position } from "react-flow-renderer/nocss";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";
import { DQNodeType } from "../models/dq-node";

interface IProps {
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
  connectionLineType: ConnectionLineType;
  sourceNode?: DQNodeType;
  sourceHandle?: HandleElement;
}

const _FloatingConnectionLine: React.FC<IProps> =
  ({ sourcePosition, targetX, targetY, targetPosition, sourceNode }) => {
  if (!sourceNode) {
    return null;
  }

  const targetNode = {
    id: "connection-target", width: 1, height: 1, position: { x: targetX, y: targetY },
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
      <path fill="none" stroke="#BCBCBC" strokeWidth={1} d={d} />
    </g>
  );
};

export const FloatingConnectionLine = observer(_FloatingConnectionLine);
FloatingConnectionLine.displayName = "FloatingConnectionLine";

