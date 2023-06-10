
import React, { MouseEventHandler, useMemo, useState } from "react";
import { EdgeProps, getBezierPath, Node, Position, useStore } from "reactflow";
import classNames from "classnames";

import { Arrowhead, kArrowheadSize } from "./arrowhead";
import { IconDeleteButton } from "./icons/delete-button";
import { getEdgeParams } from "../utils/floating-edge-util";
import { gray1, lightGray2, selectedBlue } from "../utils/theme-utils";

export const FloatingEdge: React.FC<EdgeProps> = ({ id, source, target, data }) =>  {
  const { dqRoot, readOnly, usedInExpression } = data;
  const selected = dqRoot.selectedEdgeId === id;
  const nodes = useStore((store) => {
    return store.nodeInternals;
  });
  const sourceNode: Node | undefined = useMemo(() => nodes.get(source), [source, nodes]);
  const targetNode: Node | undefined = useMemo(() => nodes.get(target), [target, nodes]);
  const [mouseOver, setMouseOver] = useState(false);
  const hoverDisplay = mouseOver && !readOnly && !dqRoot.connectingVariable;

  if (!sourceNode || !targetNode) {
    return null;
  }
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const arrowheadOffset = kArrowheadSize / 2 - 1;
  const targetX = tx +
    (targetPos === Position.Left ? -arrowheadOffset
    : targetPos === Position.Right ? arrowheadOffset
    : 0);
  const targetY = ty + 
    (targetPos === Position.Top ? -arrowheadOffset
    : targetPos === Position.Bottom ? arrowheadOffset
    : 0);
  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX,
    targetY,
  });

  const displayDelete = hoverDisplay || selected;
  const dx = tx - sx;
  const dy = ty - sy;
  let deleteX = dx / 2 + sx;
  let deleteY = dy / 2 + sy;
  // When curves go from top/bottom to left/right, they form a single curve (like the quarter of an oval).
  // In this case, the curve will not go through the center, so we have to offset it.
  // I wasn't able to get a left/right to top/bottom connection, but this math might not work if those combinations were possible.
  if ([Position.Top, Position.Bottom].includes(sourcePos) && [Position.Left, Position.Right].includes(targetPos)) {
    deleteX += -dx * 3 / 16;
    deleteY += dy * 3 / 16;
  }
  const onDeleteButtonClick = selected ? () => dqRoot.deleteEdge(source, target) : undefined;

  const handleMouseDown: MouseEventHandler<SVGPathElement> = event => {
    if (!readOnly) {
      dqRoot.setSelectedEdgeId(id);
    }
  };

  const arrowheadColor = selected || hoverDisplay ? selectedBlue
    : usedInExpression ? gray1 : lightGray2;
  const groupClassName = classNames("react-flow__connection", hoverDisplay && "hover");
  const displayArrowClassName = classNames("react-flow__edge-path", hoverDisplay && "react-flow__edge-hover", readOnly && "readonly");
  return (
    <g className={groupClassName} tabIndex={-1}>
      {/* The visible arrow */}
      <path id={id} className={displayArrowClassName} d={d[0]} />
      <Arrowhead color={arrowheadColor} targetPosition={targetPos} targetX={targetX} targetY={targetY} />
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
