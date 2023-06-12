import { Viewport } from "reactflow";

export function viewportsEqual(v1: Viewport, v2: Viewport) {
  return v1.x === v2.x && v1.y === v2.y && v1.zoom === v2.zoom;
}
