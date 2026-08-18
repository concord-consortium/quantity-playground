import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

import { VariableSlider } from "./variable-slider";
import { VariableType } from "../../models/variable";

// Stub rc-slider so its onChange (drag) and onAfterChange (release) fire deterministically
// without simulating a pointer drag in jsdom.
jest.mock("rc-slider", () => {
  const ReactMod = jest.requireActual("react") as typeof import("react");
  const Stub = (props: any) =>
    ReactMod.createElement("div", null,
      ReactMod.createElement("button",
        { "data-testid": "drag", onClick: () => props.onChange(5) }, "drag"),
      ReactMod.createElement("button",
        { "data-testid": "release", onClick: () => props.onAfterChange(5) }, "release")
    );
  return { __esModule: true, default: Stub };
});

function makeVariable(): VariableType {
  return {
    currentValue: 5,
    setTemporaryValue: jest.fn(),
    commitTemporaryValue: jest.fn(),
  } as unknown as VariableType;
}

describe("VariableSlider", () => {
  it("commits the value and calls onChangeComplete with the variable on release", () => {
    const variable = makeVariable();
    const onChangeComplete = jest.fn();
    render(<VariableSlider min={0} max={10} step={1} variable={variable} onChangeComplete={onChangeComplete} />);
    fireEvent.click(screen.getByTestId("release"));
    expect(variable.commitTemporaryValue).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenCalledWith(variable);
  });

  it("sets the temporary value but does NOT call onChangeComplete while dragging", () => {
    const variable = makeVariable();
    const onChangeComplete = jest.fn();
    render(<VariableSlider min={0} max={10} step={1} variable={variable} onChangeComplete={onChangeComplete} />);
    fireEvent.click(screen.getByTestId("drag"));
    expect(variable.setTemporaryValue).toHaveBeenCalledWith(5);
    expect(onChangeComplete).not.toHaveBeenCalled();
  });

  it("commits without error on release when onChangeComplete is omitted", () => {
    const variable = makeVariable();
    render(<VariableSlider min={0} max={10} step={1} variable={variable} />);
    fireEvent.click(screen.getByTestId("release"));
    expect(variable.commitTemporaryValue).toHaveBeenCalledTimes(1);
  });
});
