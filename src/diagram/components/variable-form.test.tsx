import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VariableForm } from "./variable-form";
import { Variable } from "../models/variable";

describe("Variable Form", () => {
  it("handles value input", () => {
    const variable = Variable.create();
    render(<VariableForm {...{variable}} />);

    const textBox = screen.getByLabelText("value:");
    userEvent.type(textBox, "123.0");
    expect(variable.value).toBe(123.0);

    userEvent.type(textBox, "{selectall}{del}");
    expect(variable.value).toBeUndefined();

  });
});
