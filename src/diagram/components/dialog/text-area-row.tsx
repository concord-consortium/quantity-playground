import React from "react";
import classNames from "classnames";

import { DialogRow } from "./dialog-row";

import "./dialog.scss";

interface ITextAreaRow {
  cols: number;
  inputId: string;
  invalid?: boolean;
  label: string;
  maxCharacters?: number;
  rows: number;
  setValue: (value: string) => void;
  spellCheck?: boolean;
  value: string;
}
export const TextAreaRow = ({
  cols, inputId, invalid, label, maxCharacters, rows, setValue, spellCheck,
  value
}: ITextAreaRow) => {
  const classes = classNames("dialog-input", { invalid }, "dialog-textarea");
  const content = (
    <textarea
      autoComplete="off"
      className={classes}
      id={inputId}
      maxLength={maxCharacters}
      value={value}
      onChange={e => setValue(e.target.value)}
      cols={cols}
      rows={rows}
      spellCheck={spellCheck}
    />
  );
  return <DialogRow content={content} inputId={inputId} label={label} />;
};
