import React from "react";

interface IMarkerProps {
  markerColor: string;
  markerId: string;
}

export const MarkerEnd: React.FC<IMarkerProps> = ({ markerId, markerColor }) => {
  return (
    <marker
      className="react-flow__arrowhead"
      data-testid="marker-end"
      id={markerId}
      markerHeight="25"
      markerWidth="25"
      markerUnits="userSpaceOnUse"
      orient="auto"
      refX="0"
      refY="0"
      viewBox="-10 -10 20 20"
    >
      <polygon
        data-testid="marker-end-polygon"
        fill={markerColor}
        points="-8,-4 0,0 -8,4 -8,-4"
        stroke={markerColor}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="2.5"
      />
    </marker>
  );
};
