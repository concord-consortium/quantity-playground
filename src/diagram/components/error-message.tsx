import React, { useState } from "react";

import { ErrorMessage } from "../utils/error";

import { IconWarning } from "./icon-warning";

import "./error-message.scss";

interface IProps {
  errorMessage?: ErrorMessage;
}

export const ErrorMessageComponent = ({ errorMessage }: IProps) => {
  const [showExpanded/*, setShowExpanded*/] = useState(true);

  if (!errorMessage) {
    return null;
  }

  return (
    <>
      <div className="error-icon" data-testid="error-icon">
        <IconWarning />
      </div>
      <div className="error-message" data-testid="error-message">
        <div className="error-top">
          <div className="error-emoji">
            {errorMessage.emoji}
          </div>
          <div className="error-short">
            {errorMessage.short}
          </div>
        </div>
        { errorMessage.expanded && showExpanded &&
          <div className="error-bottom">
            {errorMessage.expanded}
          </div>
        }
      </div>
    </>
  );
};
