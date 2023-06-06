import React from "react";
import { Position } from "reactflow";

export const kArrowheadSize = 10;

interface IArrowheadProps {
  color?: string;
  targetPosition: Position;
  targetX: number;
  targetY: number;
}
export const Arrowhead = ({ color, targetPosition, targetX, targetY }: IArrowheadProps) => {
  const _color = color || "#ff0000";
  const width = 10;
  const height = 10;

  const xOffset1 = targetPosition === Position.Left ? -width
    : targetPosition === Position.Right ? width
    : -width / 2;
  const yOffset1 = targetPosition === Position.Top ? -height
    : targetPosition === Position.Bottom ? height
    : -height / 2;
  const xOffset3 = [Position.Left, Position.Right].includes(targetPosition) ? xOffset1 : -xOffset1;
  const yOffset3 = [Position.Top, Position.Bottom].includes(targetPosition) ? yOffset1 : -yOffset1;
  const [ahx1, ahy1] = [targetX + xOffset1, targetY + yOffset1];
  const [ahx2, ahy2] = [targetX, targetY];
  const [ahx3, ahy3] = [targetX + xOffset3, targetY + yOffset3];
  const arrowheadPoints = `${ahx1},${ahy1} ${ahx2},${ahy2} ${ahx3},${ahy3} ${ahx1},${ahy1}`;

  return (
    <polygon
      // data-testid="marker-end-polygon"
      fill={_color}
      points={arrowheadPoints}
      stroke={_color}
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeWidth="2.5"
      x={targetX}
      y={targetY}
    />
  );
};
