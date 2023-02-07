import React from "react";

import { ErrorMessage } from "../utils/error";

import { IconWarning } from "./icon-warning";

import "./error-message.scss";

interface IProps {
  unitError?: ErrorMessage;
  unitMessage?: ErrorMessage;
  valueError?: ErrorMessage;
}

interface IErrorTop { errorMessage: ErrorMessage }
const ErrorTop = ({ errorMessage }: IErrorTop) => (
  <div className="error-top">
    <div className="error-emoji">
      {errorMessage.emoji}
    </div>
    <div className="error-short">
      {errorMessage.short}
    </div>
  </div>
);

export const ErrorMessageComponent = ({ unitError, unitMessage, valueError }: IProps) => {
  if (!unitError && !valueError && !unitMessage) {
    return null;
  }

  return (
    <>
      <div className="error-icon" data-testid="error-icon">
        <IconWarning />
      </div>
      <div className="error-message" data-testid="error-message">
        {valueError && <ErrorTop errorMessage={valueError} />}
        {unitError && unitError !== valueError && 
          <ErrorTop errorMessage={unitError} />
        }
        {unitMessage && <ErrorTop errorMessage={unitMessage} />}
      </div>
    </>
  );
};
