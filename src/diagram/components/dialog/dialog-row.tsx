import React from "react";

import "./dialog.scss";

interface IDialogRow {
  content: any;
  inputId: string;
  label: string;
}
export const DialogRow = ({ content, inputId, label }: IDialogRow) => {
  return (
    <div className="dialog-row">
      <label className="dialog-label" htmlFor={inputId}>
        {label}
      </label>
      {content}
    </div>
  );
};
