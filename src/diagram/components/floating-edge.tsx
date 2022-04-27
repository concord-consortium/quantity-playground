import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { getBezierPath, useStoreState } from "react-flow-renderer/nocss";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";

interface IProps {
  id: string;
  source: string;
  target: string;
}
const _FloatingEdge: React.FC<IProps>  = ({id, source, target }) =>  {
  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  const nodes = useStoreState((state) => state.nodes);
  const sourceNode = useMemo(() => nodes.find((n) => n.id === source), [source, nodes]);
  const targetNode = useMemo(() => nodes.find((n) => n.id === target), [target, nodes]);

  if (!source || !target) {
    return null;
  }
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
      <path id={id} className="react-flow__edge-path" d={d} markerEnd="url(#react-flow__arrowclosed)"/>
    </g>
  );
};

export const FloatingEdge = observer(_FloatingEdge);
FloatingEdge.displayName = "FloatingEdge";
