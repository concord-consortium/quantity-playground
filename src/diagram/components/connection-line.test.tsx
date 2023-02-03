import React from "react";
import { render, screen } from "@testing-library/react";
import { ConnectionLine } from "./connection-line";

const sourceX = 0;
const sourceY = 0;
const targetX = 100;
const targetY = 100;
const dValue = `M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`;

describe("ConnectionLine", () => {
  it ("renders an SVG path to use as a connecting line between nodes", () => {
    render(<ConnectionLine sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} />);
    expect(screen.getByTestId("connection-line")).toBeInTheDocument();
    expect(screen.getByTestId("connection-line")).toHaveAttribute("d", dValue);
  });
});
