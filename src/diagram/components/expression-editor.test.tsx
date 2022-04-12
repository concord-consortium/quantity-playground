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

describe("Expression Editor", () => {
  it("Quantity node should have a expression field and edit icon when there are two inputs", async () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const inputB = Variable.create({id: "inputB", value: 111, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputA: "inputA", inputB: "inputB"});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeB = DQNode.create({ variable: inputB.id, x: 0, y: 10 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "inputB", value: 111, unit: "m"},
        {id: "expressionVar", value: 123.5, inputA: "inputA", inputB: "inputB"}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeB);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("diagram")).toBeInTheDocument();
    expect(screen.getByTestId("variable-expression")).toBeInTheDocument();
    expect(screen.getByTestId("variable-expression-edit-button")).toBeInTheDocument();
  });
  it("quantity node entries should have expression field and edit icon when there is only one input", () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    // const inputB = Variable.create({id: "inputB", value: 111, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputA: "inputA"});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "expressionVar", inputA: "inputA"}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("variable-expression")).toBeInTheDocument();
    expect(screen.getByTestId("variable-expression-edit-button")).toBeInTheDocument();
  });
  it("quantity node entries should not have expression field and edit icon when there are no inputs", () => {
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
    expect(screen.queryByTestId("variable-expression-edit-button")).toBeNull();
  });
  it("expression editor should render", () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputA: "inputA"});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "expressionVar", value: 123.5, inputA: "inputA"}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("variable-expression-edit-button")).toBeInTheDocument();
    userEvent.click(screen.getByTestId("variable-expression-edit-button"));
    expect(screen.getByTestId("expression-editor-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("expression-editor-apply-button")).toBeInTheDocument();
    expect(screen.getByTestId("expression-editor-cancel-button")).toBeInTheDocument();
  });
  it("expression editor should save its value", () => {
    const inputA = Variable.create({id: "inputA", value: 999, unit: "m"});
    const expressionVar = Variable.create({id: "expressionVar", inputA: "inputA"});
    const root = DQRoot.create();
    const nodeA = DQNode.create({ variable: inputA.id, x: 0, y: 0 });
    const nodeExpressionVar = DQNode.create({ variable: expressionVar.id, x: 10, y: 10 });
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "expressionVar", value: 123.5, inputA: "inputA"}
      ]
    });
    root.addNode(nodeA);
    root.addNode(nodeExpressionVar);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("variable-expression-edit-button")).toBeInTheDocument();
    userEvent.click(screen.getByTestId("variable-expression-edit-button"));
    expect(screen.getByTestId("expression-editor-input-field")).toBeInTheDocument();
    userEvent.type(screen.getByTestId("expression-editor-input-field"), "9+9");
    userEvent.click(screen.getByTestId("expression-editor-apply-button"));
    expect(nodeExpressionVar.variable.expression).toBe("9+9");
  });
});
