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

describe("Quantity Node", () => {
  it("diagram should include quantity node", async () => {
    const variable = Variable.create({});
    const root = DQRoot.create();
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    root.addNode(node);
    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.add(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("diagram")).toBeInTheDocument();
    expect(screen.getByTestId("quantity-node")).toBeInTheDocument();
    expect(screen.getByTestId("delete-node-button")).toBeInTheDocument();
  });
  it("quantity node entries should be saved", () => {
    const variable = Variable.create({});
    const root = DQRoot.create();
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    root.addNode(node);
    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.add(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("variable-name")).toBeInTheDocument();
    const nameTextBox = screen.getByTestId("variable-name");
    const valueTextBox = screen.getByTestId("variable-value");
    const unitTextBox = screen.getByTestId("variable-unit");
    userEvent.type(nameTextBox, "my variable name");
    userEvent.type(valueTextBox, "45");
    userEvent.type(unitTextBox, "miles");
    expect(variable.name).toBe("my variable name");
    expect(variable.value).toEqual(45);
    expect(variable.unit).toBe("miles");

    //verify cannot enter a non-digit into value input
    userEvent.type(valueTextBox, "letter");
    expect(variable.value).toBe(undefined);
  });
});
