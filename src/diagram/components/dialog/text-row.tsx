import React from "react";
import classNames from "classnames";
import { DialogRow } from "./dialog-row";

interface ITextRow {
  disabled?: boolean;
  inputId: string;
  invalid?: boolean;
  label: string;
  maxCharacters?: number;
  setValue?: (value: string) => void;
  value: string;
  width?: number; // Width of text input
}
export const TextRow = ({
  disabled, inputId, invalid, label, maxCharacters, value, width,
  setValue
}: ITextRow) => {
  const style = { width };
  const classes = classNames("dialog-input dialog-text", { invalid });
  const content = (
    <input
      autoComplete="off"
      className={classes}
      disabled={disabled}
      id={inputId}
      type="text"
      maxLength={maxCharacters}
      value={value}
      onChange={setValue ? e => setValue(e.target.value) : undefined}
      dir="auto"
      style={style}
      spellCheck={false}
    />
  );
  return <DialogRow content={content} inputId={inputId} label={label} />;
};
