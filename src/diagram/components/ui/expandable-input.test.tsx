import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandableInput } from "./expandable-input";

describe("Expandable Input", () => {
  it ("renders a textarea field when inputType is set to 'text'", () => {
    render(<ExpandableInput inputType="text" lengthToExpand={10} title="test" value="hello" />);
    expect(screen.getByTestId("variable-test")).toBeInTheDocument();
    expect(screen.getByTestId("variable-test")).toBeInstanceOf(HTMLTextAreaElement);
  });
  it ("renders a textarea field when inputType is set to 'number'", () => {
    render(<ExpandableInput inputType="number" lengthToExpand={10} title="test" value="123" setRealValue={jest.fn()} />);
    expect(screen.getByTestId("variable-test")).toBeInTheDocument();
    expect(screen.getByTestId("variable-test")).toBeInstanceOf(HTMLTextAreaElement);
  });
  it ("renders an expanded field and toggle button when the entered value contains more characters than lengthToExpand", async () => {
    render(<ExpandableInput inputType="text" lengthToExpand={10} title="test" value="this value is more than ten characters long" />);
    const inputContainer = screen.getByTestId("expandable-input-container");
    const inputField = screen.getByTestId("variable-test");
    const toggleButton = screen.getByTestId("expandable-input-toggle-button");
    expect(inputContainer).toHaveClass("expanded long");
    expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);
    expect(inputContainer).not.toHaveClass("expanded");
    expect(inputContainer).toHaveClass("long");
    await userEvent.click(toggleButton);
    await userEvent.clear(inputField);
    expect(screen.queryByTestId("expandable-input-toggle-button")).toBeNull();
    expect(inputContainer).not.toHaveClass("expanded long");
  });
});

