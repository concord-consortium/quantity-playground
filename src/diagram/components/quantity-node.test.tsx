import React from "react";
import { render, screen } from "@testing-library/react";
import { DQNode } from "../models/dq-node";
import { Variable } from "../models/variable";
import { DQRoot } from "../models/dq-root";
import { GenericContainer } from "../models/test-utils";
import { Diagram } from "./diagram";

beforeAll(() => {
  // Setup ResizeObserver and offset* properties
  // see: https://github.com/wbkd/react-flow/issues/716
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

describe("Quantity Node", () => {
  it("diagram should include quantity node", async () => {
    const variable = Variable.create({});
    const root = DQRoot.create();
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    root.addNode(node);
    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("diagram")).toBeInTheDocument();
    expect(screen.getByTestId("quantity-node")).toBeInTheDocument();
  });
  it("Quantity node should have expression field when there are two inputs", async () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const inputB = Variable.create({id: "inputB", value: 111, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputs: ["inputA", "inputB"]});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeB = DQNode.create({ variable: inputB.id, x: 0, y: 10 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "inputB", value: 111, unit: "m"},
        {id: "expressionVar", value: 123.5, inputs: ["inputA", "inputB"]}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeB);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("diagram")).toBeInTheDocument();
    expect(screen.getByTestId("variable-expression")).toBeInTheDocument();
    const valueFields = screen.getAllByTestId("variable-value");
    expect(valueFields.length).toEqual(3);
    expect(valueFields[2]).toBeDisabled();
    const unitFields = screen.getAllByTestId("variable-unit");
    expect(unitFields.length).toEqual(3);
    expect(unitFields[2]).toBeDisabled();
  });
  it("quantity node entries should have expression field when there is only one input", () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputs: ["inputA"]});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "expressionVar", inputs: ["inputA"]}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("variable-expression")).toBeInTheDocument();
  });
  it("quantity node entries should not have expression field when there are no inputs", () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar"});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "expressionVar", value: 123.5}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.queryByTestId("variable-expression")).toBeNull();
  });
});
