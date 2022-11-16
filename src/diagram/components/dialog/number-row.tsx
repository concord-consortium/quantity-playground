import React from "react";

import { DialogRow } from "./dialog-row";
import { NumberInput } from "../ui/number-input";
import { isValidNumber } from "../../utils/validate";

import "./dialog.scss";

interface INumberRow {
  inputId: string;
  label: string;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
  width?: number; // Width of text input
}
export const NumberRow = ({ inputId, label, realValue, setRealValue, width }: INumberRow) => {
  const style = { width };
  const content = (
    <NumberInput 
      className="dialog-input dialog-text"
      isValid={isValidNumber}
      realValue={realValue}
      setRealValue={setRealValue}
      otherProps={{ id: inputId, style }}
    />
  );
  return <DialogRow content={content} inputId={inputId} label={label} />;
};
