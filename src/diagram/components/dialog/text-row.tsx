import React from "react";
import classNames from "classnames";

import { DialogRow } from "./dialog-row";

interface ITextRow {
  inputId: string;
  invalid?: boolean;
  label: string;
  maxCharacters?: number;
  setValue: (value: string) => void;
  value: string;
  width?: number; // Width of text input
}
export const TextRow = ({ inputId, invalid, label, maxCharacters, setValue, value, width }: ITextRow) => {
  const style = { width };
  const classes = classNames("dialog-input", { invalid }, "dialog-text");
  const content = (
    <input
      className={classes}
      id={inputId}
      type="text"
      maxLength={maxCharacters}
      value={value}
      onChange={e => setValue(e.target.value)}
      dir="auto"
      style={style}
    />
  );
  return <DialogRow content={content} inputId={inputId} label={label} />;
};
