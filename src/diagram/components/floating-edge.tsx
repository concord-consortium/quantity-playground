import { observer } from "mobx-react-lite";
import React from "react";
import { getBezierPath } from "react-flow-renderer/nocss";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";
import { DQNodeType } from "../models/dq-node";

interface IProps {
  id: string;
  source: DQNodeType;
  target: DQNodeType;
  // style: any
}
// const _FloatingEdge: React.FC<IProps>  = ({id, source, target, style}) =>  {
  const _FloatingEdge: React.FC<IProps>  = ({id, source, target }) =>  {
  if (!source || !target) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(source, target);

  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
  return (
    <g className="react-flow__connection">
      <path id={id} className="react-flow__edge-path" d={d} />
    </g>
  );
};

export const FloatingEdge = observer(_FloatingEdge);
FloatingEdge.displayName = "FloatingEdge";
