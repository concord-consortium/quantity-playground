import React, { ChangeEvent, FocusEvent, MouseEvent, useState } from "react";
import classNames from "classnames";
import { NumberInput } from "./number-input";
import { isValidNumber } from "../../utils/validate";
import { IconExpand } from "../icon-expand";

import "./expandable-input.scss";

interface IProps {
  error?: boolean;
  inputType: "text" | "number";
  lengthToExpand: number;
  maxLength?: number;
  placeholder?: string;
  title: string;
  value?: string | number;
  handleBlur: () => void;
  handleChange?: (evt: ChangeEvent<HTMLTextAreaElement>) => void;
  handleFocus: (evt: FocusEvent<HTMLInputElement|HTMLTextAreaElement>|MouseEvent<HTMLInputElement|HTMLTextAreaElement>) => void;
  handleKeyDown?: (evt: React.KeyboardEvent) => void;
  handleToggle: () => void;
  setRealValue: (value: number | undefined) => void;
}

export const ExpandableInput = ({
  error, inputType, lengthToExpand, maxLength, placeholder, title, value, handleBlur,
  handleChange, handleFocus, handleKeyDown, handleToggle, setRealValue
}: IProps) => {
  const [hasLongValue, setHasLongValue] = useState(!!(value && value.toString().length >= lengthToExpand));
  const [showFullValue, setShowFullValue] = useState(hasLongValue);

  const handlToggleFullValue = () => {
    setShowFullValue(!showFullValue);
    handleToggle();
  };

  const onChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    const isLongValue = !!(evt.target.value && evt.target.value.length >= lengthToExpand);
    setHasLongValue(isLongValue);
    setShowFullValue(isLongValue);
    if (handleChange) {
      handleChange(evt);
    }
  };

  const getInputElement = () => {
    if (inputType === "number") {
      return (
        <NumberInput
          className={inputClasses}
          dataTestId={`variable-${title}`}
          isValid={isValidNumber}
          realValue={value ? +value : undefined}
          setRealValue={setRealValue}
          unsetSelectedNode={handleBlur}
          updateShowFullValue={onChange}
          otherProps={{
            placeholder: "value",
            autoComplete: "off",
            spellCheck: "false",
            maxLength,
            onMouseDown: handleFocus,
            onFocus: handleFocus,
          }}
        />
      );
    } else {
      return (
        <textarea
          autoComplete="off"
          className={inputClasses}
          data-testid={`variable-${title}`}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChange={onChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onMouseDown={handleFocus}
          placeholder={placeholder}
          spellCheck="false"
          value={value}
        />
      );
    }
  };

  const containerClasses = classNames(
    "expandable-input-container",
    {"expanded": hasLongValue && showFullValue},
    {"long": hasLongValue}
  );
  const inputClasses = classNames(
    "variable-info variable-expression-area",
    title,
    {"invalid": error}
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
