import React, { MouseEventHandler, useMemo, useState } from "react";
import { EdgeProps, getBezierPath, Node, useStore } from "reactflow";
import classNames from "classnames";

import { IconDeleteButton } from "./icons/delete-button";
import { getEdgeParams } from "../utils/floating-edge-util";

export const FloatingEdge: React.FC<EdgeProps> = ({ id, source, target, data }) =>  {
  const { dqRoot } = data;
  const selected = dqRoot.selectedEdgeId === id;
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

  const displayDelete = mouseOver || selected;
  const deleteX = (tx - sx) / 2 + sx;
  const deleteY = (ty - sy) / 2 + sy;
  const onDeleteButtonClick = selected ? () => dqRoot.deleteEdge(source, target) : undefined;

  const handleMouseDown: MouseEventHandler<SVGPathElement> = event => {
    dqRoot.setSelectedEdgeId(id);
  };

  const groupClassName = classNames("react-flow__connection", mouseOver && "hover");
  const displayArrowClassName = classNames("react-flow__edge-path", mouseOver && "react-flow__edge-hover");
  return (
    <g className={groupClassName} tabIndex={-1}>
      {/* The visible arrow */}
      <path id={id} className={displayArrowClassName} d={d[0]} />
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
      { displayDelete && <IconDeleteButton onClick={onDeleteButtonClick} x={deleteX} y={deleteY} /> }
    </g>
  );
};
