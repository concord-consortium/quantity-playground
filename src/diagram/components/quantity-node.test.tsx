import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DQNode } from "../models/dq-node";
import { Variable } from "../models/variable";
import { DQRoot } from "../models/dq-root";
import { GenericContainer } from "../models/test-utils";
import { Diagram } from "./diagram";
import { kMaxNotesCharacters, processName } from "../utils/validate";

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
  it("quantity node entries should be saved", async () => {
    const variable = Variable.create({});
    const root = DQRoot.create();
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    root.addNode(node);
    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);

    expect(screen.getByTestId("variable-name")).toBeInTheDocument();
    const nameTextBox = screen.getByTestId("variable-name");
    const valueTextBox = screen.getByTestId("variable-value");
    const unitTextBox = screen.getByTestId("variable-unit");
    const descriptionTextBox = screen.getByTestId("variable-description");
    const variableName = "my variable name";
    await userEvent.type(nameTextBox, variableName);
    await userEvent.type(valueTextBox, "45");
    await userEvent.type(unitTextBox, "miles");
    await userEvent.type(descriptionTextBox, "a\ndescription");
    expect(variable.name).toBe(processName(variableName));
    expect(variable.value).toEqual(45);
    expect(variable.unit).toBe("miles");
    expect(variable.description).toBe("a\ndescription");

    //verify entering a non-number does not change the value
    await userEvent.type(valueTextBox, "letter");
    expect(variable.value).toBe(undefined);
    expect(valueTextBox.className.split(" ")).toContain("invalid");

    // Notes are limited to kMaxNotesCharacters
    const notesTextBox = screen.getByTestId("variable-description");
    const typedNotes = "a".repeat(kMaxNotesCharacters + 5);
    const acceptedNotes = "a".repeat(kMaxNotesCharacters);
    await userEvent.clear(notesTextBox);
    await userEvent.type(notesTextBox, typedNotes);
    expect(variable.description).toBe(acceptedNotes);
  });
  it("can edit a variable color", async () => {
    const variable = Variable.create({});
    expect(variable.color).toBe("#e98b42");
    const root = DQRoot.create();
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    root.addNode(node);
    const container = GenericContainer.create();
    container.add(variable);
    container.setRoot(root);
    render(<Diagram dqRoot={root} />);
    expect(screen.getByTestId("variable-name")).toBeInTheDocument();
    const colorSelectButton = screen.getByTestId("color-edit-button");
    await userEvent.click(colorSelectButton);
    expect(screen.getByTitle("color picker")).toBeInTheDocument();
    await userEvent.click(screen.getByTitle("#9900EF"));
    expect(variable.color).toBe("#9900ef");
  });
});
