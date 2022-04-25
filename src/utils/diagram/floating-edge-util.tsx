import { Position } from "react-flow-renderer";
import { DQNodeType } from "../../diagram/models/dq-node";

const kNodeWidth = 220;
const kNodeHeight = 155;

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
// function getNodeIntersection(node1x: number, node1y: number, node2x: number, node2y: number) {
  function getNodeIntersection(intersectionNode: any, targetNode: any) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    position: intersectionNodePosition,
  } = intersectionNode;
  const targetPosition = targetNode.position;  // const targetPosition = {node2.x, node2.y};
  const w = kNodeWidth / 2;
  const h = kNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + w;
  const y1 = targetPosition.y + h;

  const a = 1 / (Math.abs(x1) + Math.abs(y1));
  const xx3 = a * x1;
  const yy3 = a * y1;
  const xIntersect = w * (xx3 + yy3) + x2;
  const yIntersect = h * (-xx3 + yy3) + y2;

  return { xIntersect, yIntersect };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: any, intersectionPoint: any) {
  const n = { ...node.position, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: DQNodeType, target: any) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

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
