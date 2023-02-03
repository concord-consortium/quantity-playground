import React from "react";
import { render, screen } from "@testing-library/react";
import { MarkerEnd } from "./marker-end";

const markerId = "test-id";
const markerColor = "#ff0000";

describe("MarkerEnd", () => {
  it ("renders an SVG marker to use on connecting line between nodes", () => {
    render(<MarkerEnd markerId={markerId} markerColor={markerColor} />);
    expect(screen.getByTestId("marker-end")).toBeInTheDocument();
    expect(screen.getByTestId("marker-end")).toHaveAttribute("id", markerId);
    expect(screen.getByTestId("marker-end-polygon")).toBeInTheDocument();
    expect(screen.getByTestId("marker-end-polygon")).toHaveAttribute("fill", markerColor);
  });
});
