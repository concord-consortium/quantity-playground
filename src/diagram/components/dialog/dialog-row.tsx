import React from "react";
import classNames from "classnames";

import "./dialog.scss";
interface IDialogRow {
  className?: string;
  content: any;
  disabled?: boolean;
  inputId: string;
  label: string;
}

export const DialogRow = ({ className, content, disabled, inputId, label }: IDialogRow) => {
  return (
    <div className={classNames("dialog-row", className, { disabled })}>
      <label className="dialog-label" htmlFor={inputId}>
        {label}
      </label>
      {content}
    </div>
  );
};
