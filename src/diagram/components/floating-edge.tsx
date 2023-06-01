import React, { MouseEventHandler, useMemo, useState } from "react";
import { EdgeProps, getBezierPath, Node, useStore } from "reactflow";

import { getEdgeParams } from "../utils/floating-edge-util";

export const FloatingEdge: React.FC<EdgeProps> = ({ id, source, target, data }) =>  {
  const { dqRoot } = data;
  const nodes = useStore((store) => {
    return store.nodeInternals;
  });
  const sourceNode: Node | undefined = useMemo(() => nodes.get(source), [source, nodes]);
  const targetNode: Node | undefined = useMemo(() => nodes.get(target), [target, nodes]);
  const [mouseOver, setMouseOver] = useState(false);

  if (!sourceNode || !targetNode) {
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

  const handleMouseDown: MouseEventHandler<SVGPathElement> = event => {
    dqRoot.setSelectedEdgeId(id);
  };

  const className = `react-flow__edge-path ${mouseOver ? "react-flow__edge-hover" : ""}`;
  return (
    <g className="react-flow__connection" tabIndex={-1}>
      {/* The visible arrow */}
      <path id={id} className={className} d={d[0]} />
      {/* The clickable target */}
      <path
        id={`${id}-target`}
        className="react-flow__edge-target"
        d={d[0]}
        fill="transparent"
        onMouseDown={handleMouseDown}
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
      />
    </g>
  );
};
