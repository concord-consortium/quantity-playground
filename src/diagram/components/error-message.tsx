import React from "react";
import { IconWarning } from "./icon-warning";

import "./error-message.scss";

interface IProps {
  unitError?: string;
  unitMessage?: string;
  valueError?: string;
}

export const ErrorMessage = ({ unitError, unitMessage, valueError }: IProps) => {
  if (!unitError && !valueError && !unitMessage) {
    return null;
  }

  return (
    <>
      <div className="error-icon" data-testid="error-icon">
        <IconWarning />
      </div>
      <div className="error-message" data-testid="error-message">
        {valueError && <p>Warning: {valueError}</p>}
        {unitError && unitError !== valueError && <p>Warning: {unitError}</p>}
        {unitMessage && <p>Warning: {unitMessage}</p>}
      </div>
    </>
  );
};
