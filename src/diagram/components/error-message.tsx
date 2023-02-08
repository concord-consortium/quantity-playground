import React, { useState } from "react";

import { ErrorMessage } from "../utils/error";

import { IconWarning } from "./icon-warning";
import { IconMorePrompt } from "./icons/icon-more-prompt";

import "./error-message.scss";

interface IProps {
  errorMessage?: ErrorMessage;
}

export const ErrorMessageComponent = ({ errorMessage }: IProps) => {
  const [showExpanded, setShowExpanded] = useState(false);

  if (!errorMessage) {
    return null;
  }

  const handleExpandClick = (event: any) => {
    setShowExpanded(true);
  };

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
          { errorMessage.expanded && !showExpanded &&
            <button onClick={handleExpandClick} className="more-prompt-button">
              <IconMorePrompt />
            </button>
          }
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
