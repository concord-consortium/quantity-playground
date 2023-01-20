import React, { ChangeEvent, FocusEvent, MouseEvent, useEffect, useState } from "react";
import classNames from "classnames";
import { NumberInput } from "./number-input";
import { isValidNumber } from "../../utils/validate";
import { IconExpand } from "../icon-expand";

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
  handleChange?: (evt: ChangeEvent<HTMLTextAreaElement>) => void;
  handleFocus?: (evt: FocusEvent<HTMLInputElement|HTMLTextAreaElement>|MouseEvent<HTMLInputElement|HTMLTextAreaElement>) => void;
  handleKeyDown?: (evt: React.KeyboardEvent) => void;
  setRealValue?: (value: number | undefined) => void;
}

export const ExpandableInput = ({
  error, disabled, inputType, lengthToExpand, maxLength, placeholder, title, value,
  handleChange, handleFocus, handleKeyDown, setRealValue
}: IProps) => {

  const isLongValue = (val: number | string | undefined, length: number) => {
    return val && val.toString().length >= length;
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
      const displayValue = !isFinite(Number(value)) && inputType === "number" ? "" : value;
      return (
        <textarea
          autoComplete="off"
          className={inputClasses}
          data-testid={`variable-${title}`}
          disabled={disabled}
          maxLength={maxLength}
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

  // Ensure that hasLongValue is updated when the value changes in 
  // disabled fields -- the onChange handler above does not get triggered
  // by disabled fields.
  useEffect(() => {
    if (disabled && value) {
      setHasLongValue(isLongValue(value, lengthToExpand));
    }
  }, [disabled, lengthToExpand, value]);

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
