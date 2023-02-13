import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorMessageComponent } from "./error-message";
import { basicErrorMessage } from "../utils/error";

describe("Expandable Input", () => {
  it ("renders an icon and message when passed the proper values", () => {
    const errorMessage = basicErrorMessage("invalid unit")
      ?? basicErrorMessage("this is a unit message")
      ?? basicErrorMessage("invalid value");
    render(<ErrorMessageComponent
      errorMessage={errorMessage}
    />);
    expect(screen.getByTestId("error-icon")).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toContainHTML("Warning: invalid unit");
  });
  it ("does not render anything when no values are passed", () => {
    render(<ErrorMessageComponent />);
    expect(screen.queryByTestId("error-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});

