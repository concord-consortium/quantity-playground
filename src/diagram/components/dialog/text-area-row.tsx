import React from "react";
import classNames from "classnames";
import { DialogRow } from "./dialog-row";

import "./dialog.scss";

interface ITextAreaRow {
  cols?: number;
  disabled?: boolean;
  inputId: string;
  invalid?: boolean;
  label: string;
  maxCharacters?: number;
  preventLineBreaks?: boolean;
  rows?: number;
  setValue?: (value: string) => void;
  spellCheck?: boolean;
  value: string;
}
export const TextAreaRow = ({
  cols, disabled, inputId, invalid, label, maxCharacters, preventLineBreaks, rows,
  spellCheck, value, setValue
}: ITextAreaRow) => {

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (preventLineBreaks && e.key === "Enter") {
      e.preventDefault();
    }
  };

  const classes = classNames("dialog-input dialog-textarea", { invalid });
  const content = (
    <textarea
      autoComplete="off"
      className={classes}
      disabled={disabled}
      id={inputId}
      maxLength={maxCharacters}
      value={value}
      onChange={setValue ? e => setValue(e.target.value) : undefined}
      onKeyDown={handleKeydown}
      cols={cols}
      rows={rows}
      spellCheck={spellCheck}
    />
  );
  return <DialogRow content={content} disabled={disabled} inputId={inputId} label={label} />;
};
