import { observer } from "mobx-react-lite";
import React from "react";
import { getBezierPath } from "react-flow-renderer/nocss";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";
import { DQRootType } from "../models/dq-root";

interface IProps {
  id: string;
  source: string;
  target: string;
  data: {dqRoot: DQRootType};
}
const _FloatingEdge: React.FC<IProps>  = ({id, source, target, data }) =>  {
  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  if (!source || !target) {
    return null;
  }
  const root = data.dqRoot;
  const sourceNode: any = root.reactFlowElements.find(el => el.id === source);
  const targetNode = root.reactFlowElements.find(el => el.id === target);
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
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
