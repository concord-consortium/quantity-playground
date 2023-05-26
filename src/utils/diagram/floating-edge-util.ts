import { Node, Position } from "reactflow";

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(sourceNode: Node, targetNode: Node) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    position: intersectionNodePosition,
  } = sourceNode;
  const targetPosition = targetNode.position;
  const w = (intersectionNodeWidth ?? 0) / 2;
  const h = (intersectionNodeHeight ?? 0) / 2;
  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + w;
  const y1 = targetPosition.y + h;
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const xIntersect = w * (xx3 + yy3) + x2;
  const yIntersect = h * (-xx3 + yy3) + y2;

  return { xIntersect, yIntersect };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: Node, intersectionPoint: any) {
  const n = { ...node.position, ...node };
  const px = Math.round(intersectionPoint.xIntersect);
  const py = Math.round(intersectionPoint.yIntersect);

  const diffs = [
    [Math.abs(px - n.x), Position.Left],
    [Math.abs(px - (n.x + (n.width || 0))), Position.Right],
    [Math.abs(py - n.y), Position.Top],
    [Math.abs(py - (n.y + (n.height || 0))), Position.Bottom]
  ];
  let min: any;
  diffs.forEach(diff => {
    if (!min || diff[0] < min[0]) {
      min = diff;
    }
  });
  return min[1];
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  const sx = sourceIntersectionPoint.xIntersect;
  const sy = sourceIntersectionPoint.yIntersect;
  const tx = targetIntersectionPoint.xIntersect;
  const ty = targetIntersectionPoint.yIntersect;

  return { sx, sy, tx, ty, sourcePos, targetPos };
}
