import React from "react";
import { DialogRow } from "./dialog-row";
import { NumberInput } from "../ui/number-input";
import { isValidNumber } from "../../utils/validate";
import classNames from "classnames";

import "./dialog.scss";

interface INumberRow {
  className?: string;
  disabled?: boolean;
  inputId: string;
  label: string;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
  width?: number; // Width of text input
}

export const NumberRow = ({
  className, disabled, inputId, label, realValue, width,
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
      otherProps={{ id: inputId, style }}
    />
  );
  return <DialogRow content={content} disabled={disabled} inputId={inputId} label={label} />;
};
