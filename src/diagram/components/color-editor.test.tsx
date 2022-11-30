import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DQNode } from "../models/dq-node";
import { Variable } from "../models/variable";
import { DQRoot } from "../models/dq-root";
import { GenericContainer } from "../models/test-utils";
import { Diagram } from "./diagram";

beforeAll(() => {
  // Setup ResizeObserver and offset* properties
  // see: https://github.com/wbkd/react-flow/issues/716#issuecomment-915831149
  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));

  Object.defineProperties(window.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  (window.SVGElement as any).prototype.getBBox = () => ({x:0, y:0, width: 0, height: 0});
});

describe("Color Editor", () => {
  it("should render", async () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    // const expressionVar = Variable.create({id: "expressionVar", inputs: ["inputA"]});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    // const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        // {id: "expressionVar", value: 123.5, inputs: ["inputA"]}
      ]
    });
    root.addNode(nodeA);
    // root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("color-edit-button")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("color-edit-button"));
    expect(screen.getByTitle("color picker")).toBeInTheDocument();
  });
  it("should be removed when icon is clicked for a second time", async () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    // const expressionVar = Variable.create({id: "expressionVar", inputs: ["inputA"]});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    // const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        // {id: "expressionVar", value: 123.5, inputs: ["inputA"]}
      ]
    });
    root.addNode(nodeA);
    // root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("color-edit-button")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("color-edit-button"));
    expect(screen.getByTitle("color picker")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("color-edit-button"));
    expect(screen.queryByTitle("color picker")).toBeNull();
  });
  it("should be removed when a color is selected", async () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    // const expressionVar = Variable.create({id: "expressionVar", inputs: ["inputA"]});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    // const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        // {id: "expressionVar", value: 123.5, inputs: ["inputA"]}
      ]
    });
    root.addNode(nodeA);
    // root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("color-edit-button")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("color-edit-button"));
    expect(screen.getByTitle("color picker")).toBeInTheDocument();
    await userEvent.click(screen.getByTitle("#e6e6e6"));
    expect(screen.queryByTitle("color picker")).toBeNull();
  });
});
