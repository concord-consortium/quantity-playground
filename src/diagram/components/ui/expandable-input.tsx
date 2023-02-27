import React, { ChangeEvent, FocusEvent, MouseEvent, useEffect, useState } from "react";
import classNames from "classnames";
import { NumberInput } from "./number-input";
import { isValidNumber } from "../../utils/validate";
import { IconExpand } from "../icons/icon-expand";

import "./expandable-input.scss";

interface IProps {
  disabled?: boolean;
  error?: boolean;
  inputType: "text" | "number";
  lengthToExpand: number;
  maxLength?: number;
  placeholder?: string;
  title: string;
  value?: string | number;
  handleBlur?: (evt: FocusEvent<HTMLTextAreaElement>) => void;
  handleChange?: (evt: ChangeEvent<HTMLTextAreaElement>) => void;
  handleFocus?: (evt: FocusEvent<HTMLInputElement|HTMLTextAreaElement>|MouseEvent<HTMLInputElement|HTMLTextAreaElement>) => void;
  handleKeyDown?: (evt: React.KeyboardEvent) => void;
  setRealValue?: (value: number | undefined) => void;
}

export const ExpandableInput = ({
  error, disabled, inputType, lengthToExpand, maxLength, placeholder, title, value,
  handleBlur, handleChange, handleFocus, handleKeyDown, setRealValue
}: IProps) => {

  const isLongValue = (val: number | string | undefined, length: number) => {
    return !!(val && val.toString().length >= length);
  };

  const [hasLongValue, setHasLongValue] = useState(isLongValue(value, lengthToExpand));
  const [showFullValue, setShowFullValue] = useState(hasLongValue);

  const handlToggleFullValue = () => {
    setShowFullValue(!showFullValue);
  };

  const onChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    const isLong = isLongValue(evt.target.value, lengthToExpand);
    setHasLongValue(isLong);
    setShowFullValue(isLong);
    if (handleChange) {
      handleChange(evt);
    }
  };

  const getInputElement = () => {
    const inputClasses = classNames(
      "variable-info variable-expression-area",
      title,
      {"invalid": !disabled && error}
    );

    // NumberInput performs special handling of the entered value before 
    // saving it which requires setRealValue. NumberInput should not be
    // used for disabled value fields since their value may be a string.
    if (!disabled && inputType === "number" && setRealValue) {
      return (
        <NumberInput
          className={inputClasses}
          dataTestId={`variable-${title}`}
          isValid={isValidNumber}
          realValue={value ? +value : undefined}
          setRealValue={setRealValue}
          onValueChange={onChange}
          otherProps={{
            placeholder: "value",
            maxLength,
            onMouseDown: handleFocus,
            onFocus: handleFocus,
          }}
        />
      );
    } else {
      // Don't output NaN or Infinity as a computed value.
      // Before checking for NaN or Infinity, make sure to remove any commas in a value
      // that is a string. Otherwise, a string value like "1,000" will be considered NaN.
      const possibleNumberValue = typeof value === "string" ? value.replace(/,/g, "") : value;
      const displayValue = !isFinite(Number(possibleNumberValue)) && inputType === "number" ? "" : value;
      return (
        <textarea
          autoComplete="off"
          className={inputClasses}
          data-testid={`variable-${title}`}
          disabled={disabled}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChange={onChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onMouseDown={handleFocus}
          placeholder={placeholder}
          spellCheck="false"
          value={displayValue}
        />
      );
    }
  };

  // Ensure that hasLongValue is updated when the value changes. This is done separately
  // from the onChange handler because the latter does not get triggered by disabled fields,
  // nor when the value is set using the Edit Variable dialog.
  useEffect(() => {
    setHasLongValue(isLongValue(value, lengthToExpand));
  }, [lengthToExpand, value]);

  const containerClasses = classNames(
    "expandable-input-container",
    {"expanded": hasLongValue && showFullValue},
    {"long": hasLongValue}
  );

  return (
    <div className={containerClasses} data-testid="expandable-input-container">
      {getInputElement()}
      {hasLongValue &&
        <button className="expandable-input-toggle" data-testid="expandable-input-toggle-button" onClick={handlToggleFullValue}>
          <IconExpand />
        </button>
      }
    </div>
  );
};
