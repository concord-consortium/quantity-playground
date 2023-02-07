import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorMessageComponent } from "./error-message";
import { basicErrorMessage } from "../utils/error";

describe("Expandable Input", () => {
  it ("renders an icon and message when passed the proper values", () => {
    render(<ErrorMessageComponent
      unitError={basicErrorMessage("invalid unit")}
      unitMessage={basicErrorMessage("this is a unit message")}
      valueError={basicErrorMessage("invalid value")}
    />);
    expect(screen.getByTestId("error-icon")).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toContainHTML("<p>Warning: invalid unit</p>");
    expect(screen.getByTestId("error-message")).toContainHTML("<p>Warning: this is a unit message</p>");
    expect(screen.getByTestId("error-message")).toContainHTML("<p>Warning: invalid value</p>");
  });
  it ("does not render anything when no values are passed", () => {
    render(<ErrorMessageComponent />);
    expect(screen.queryByTestId("error-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});

