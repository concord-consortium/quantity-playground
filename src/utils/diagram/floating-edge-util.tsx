import { Position } from "react-flow-renderer/nocss";

const kNodeWidth = 220;
const kNodeHeight = 155;
const w = kNodeWidth / 2;
const h = kNodeHeight / 2;

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getSourceNodeIntersection(sourceNode: any, targetNode: any) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { position: sourcePosition } = sourceNode;
  const { position: targetPosition } = targetNode;

  const x2 = sourcePosition.x + kNodeWidth;
  const y2 = sourcePosition.y + h;
  const x1 = targetPosition.x;
  const y1 = targetPosition.y + h;
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(x1) + Math.abs(y1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const xIntersect = w * (xx3 + yy3) + x2;
  const yIntersect = h * (-xx3 + yy3) + y2;

  return { xIntersect, yIntersect };
}

function getTargetNodeIntersection(sourceNode: any, targetNode: any) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { position: sourcePosition } = sourceNode;
  const { position: targetPosition } = targetNode;

  const x2 = sourcePosition.x + w;
  const y2 = sourcePosition.y + h;
  const x1 = targetPosition.x + kNodeWidth;
  const y1 = targetPosition.y + h;
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(x1) + Math.abs(y1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const xIntersect = w * (xx3 + yy3) + x2;
  const yIntersect = h * (-xx3 + yy3) + y2;

  return { xIntersect, yIntersect };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: any, intersectionPoint: any) {
  const nx = Math.round(node.x);
  const ny = Math.round(node.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + kNodeWidth - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= node.y + kNodeHeight - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: any, target: any) {
  const sourceIntersectionPoint = getSourceNodeIntersection(source, target);
  const targetIntersectionPoint = getTargetNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.xIntersect,
    sy: sourceIntersectionPoint.yIntersect,
    tx: targetIntersectionPoint.xIntersect,
    ty: targetIntersectionPoint.yIntersect,
    sourcePos,
    targetPos,
  };
}
