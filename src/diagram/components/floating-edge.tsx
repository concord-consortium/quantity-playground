import React, { useMemo } from "react";
import { getBezierPath, useStore } from "reactflow";
import { getEdgeParams } from "../../utils/diagram/floating-edge-util";

interface IProps {
  id: string;
  source: string;
  target: string;
}

export const FloatingEdge: React.FC<IProps> = ({ id, source, target }) =>  {
  const nodes = useStore((store) => {
    return store.nodeInternals;
  });
  const sourceNode = useMemo(() => nodes.get(source), [source, nodes]);
  const targetNode = useMemo(() => nodes.get(target), [target, nodes]);

  if (!source || !target) {
    return null;
  }
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const arrowHeadOffset = 3;
  const targetX = sx < tx ? tx - arrowHeadOffset : tx + arrowHeadOffset;
  const targetY = sy < ty ? ty - arrowHeadOffset : ty + arrowHeadOffset;
  console.log("sx", sx);
  console.log("sy", sy);
  console.log("sourcePos", sourcePos);
  console.log("targetPos", targetPos);
  console.log("targetX", targetX);
  console.log("targetY", targetY);
  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX,
    targetY,
  });
  console.log("d", d);

  // used the react-flow__edgeupdater class because it has some react-flow-renderer event handler that allows the edge to be deleted
  return (
    <g className="react-flow__connection" tabIndex={-1}>
      <path id={id} className="react-flow__edge-path react-flow__edgeupdater" d={d[0]}/>
    </g>
  );
};
