import React from "react";
import classnames from "classnames";

import "./dialog.scss";

interface ITextArea {
  cols: number;
  rows: number;
}
interface IDialogRow {
  invalid?: boolean;
  label: string;
  maxCharacters?: number;
  setValue: (value: string) => void;
  textarea?: ITextArea; // Include { cols, rows } to render a textarea instead of text input
  value: string;
  width?: number; // Width of text input
}
export const DialogRow = ({ invalid, label, maxCharacters, setValue, textarea, value, width }: IDialogRow) => {
  const style = { width };
  const classes = classnames("dialog-input", { invalid }, textarea ? "dialog-textarea" : "dialog-text");
  return (
    <div className="dialog-row">
      <label className="dialog-label" htmlFor={label}>
        {label}
      </label>
      { textarea
        ? <textarea
          className={classes}
          id={label}
          maxLength={maxCharacters}
          value={value}
          onChange={e => setValue(e.target.value)}
          cols={textarea.cols}
          rows={textarea.rows}
        />
        : <input
          className={classes}
          id={label}
          type="text"
          maxLength={maxCharacters}
          value={value}
          onChange={e => setValue(e.target.value)}
          dir="auto"
          style={style}
        />
      }
    </div>
  );
};
