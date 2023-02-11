import React, { useState } from "react";

import { ErrorMessage } from "../utils/error";

import { IconNotification } from "./icons/icon-notification";
import { IconMorePrompt } from "./icons/icon-more-prompt";

import "./error-message.scss";

interface IProps {
  dialog?: boolean; // Styles for dialog when true, otherwise styles for variable card
  errorMessage?: ErrorMessage;
}

export const ErrorMessageComponent = ({ dialog, errorMessage }: IProps) => {
  const [showExpanded, setShowExpanded] = useState(false);

  if (!errorMessage) {
    return null;
  }

  const handleExpandClick = (event: any) => {
    setShowExpanded(true);
  };

  if (dialog) {
    return (
      <div className="dialog-error-message error-message">
        <div className="error-icon">
          <IconNotification />
        </div>
        <div className="error-main">
          {errorMessage.emoji &&
            <span className="error-emoji">
              {errorMessage.emoji}
            </span>
          }
          <span className="error-short">
            {errorMessage.short}
          </span>
          {errorMessage.expanded &&
            <span className="error-expanded">
              {errorMessage.expanded}
            </span>
          }
        </div>
      </div>
    );
  } else {
    return (
      <div className="card-error-message">
        <div className="error-icon" data-testid="error-icon">
          <IconNotification />
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
      </div>
    );
  }
};
