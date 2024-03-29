import React from "react";
import classNames from "classnames";

import { DialogRow } from "./dialog-row";
import { NumberInput } from "../ui/number-input";
import { isValidNumber } from "../../utils/validate";

import "./dialog.scss";

interface INumberRow {
  className?: string;
  disabled?: boolean;
  inputId: string;
  label: string;
  preventLineBreaks?: boolean;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
  width?: number; // Width of text input
}

export const NumberRow = ({
  className, disabled, inputId, label, preventLineBreaks, realValue, width,
  setRealValue
}: INumberRow) => {
  const style = { width };
  const content = (
    <NumberInput 
      className={classNames("dialog-input dialog-text", className)}
      disabled={disabled}
      isValid={isValidNumber}
      realValue={realValue}
      setRealValue={setRealValue}
      preventLineBreaks={preventLineBreaks}
      otherProps={{ id: inputId, style }}
    />
  );
  return <DialogRow content={content} disabled={disabled} inputId={inputId} label={label} />;
};
