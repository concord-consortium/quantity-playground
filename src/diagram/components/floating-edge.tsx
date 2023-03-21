import React, { useMemo } from "react";
import { getBezierPath, useStoreState } from "react-flow-renderer/nocss";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";

interface IProps {
  id: string;
  source: string;
  target: string;
}

export const FloatingEdge: React.FC<IProps> = ({ id, source, target }) =>  {
  const nodes = useStoreState((state) => state.nodes);
  const sourceNode = useMemo(() => nodes.find((n) => n.id === source), [source, nodes]);
  const targetNode = useMemo(() => nodes.find((n) => n.id === target), [target, nodes]);

  if (!source || !target) {
    return null;
  }
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const arrowHeadOffset = 3;
  const targetX = sx < tx ? tx - arrowHeadOffset : tx + arrowHeadOffset;
  const targetY = sy < ty ? ty - arrowHeadOffset : ty + arrowHeadOffset;
  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX,
    targetY,
  });

  // used the react-flow__edgeupdater class because it has some react-flow-renderer event handler that allows the edge to be deleted
  return (
    <g className="react-flow__connection" tabIndex={-1}>
      <path id={id} className="react-flow__edge-path react-flow__edgeupdater" d={d}/>
    </g>
  );
};
