import React, { ChangeEvent, useEffect, useState } from "react";
import classNames from "classnames";

interface INumberInput {
  className?: string;
  dataTestId?: string;
  disabled?: boolean;
  isValid: (value: string) => boolean;
  otherProps?: Record<string, any>;
  preventLineBreaks?: boolean;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
  onValueChange?: (evt: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const NumberInput = ({
  className, dataTestId, disabled, isValid, otherProps, preventLineBreaks, realValue,
  setRealValue, onValueChange
}: INumberInput) => {
  const [value, setValue] = useState(realValue?.toString() || "");
  useEffect(() => {
    setValue(realValue?.toString() || "");
  }, [realValue]);
  
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onValueChange?.(e);
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (preventLineBreaks && e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onBlur = () => {
    if (value === "" || !isValid(value)) {
      setRealValue(undefined);
    } else {
      setRealValue(+value);
    }
  };

  // We explicitly make "" valid here because it represents a variable with no specified value
  const invalid = value !== "" && !isValid(value);

  return (
    <textarea
      className={classNames(className, { invalid })}
      data-testid={dataTestId}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeydown}
      onBlur={onBlur}
      {...otherProps}
      autoComplete="off"
      spellCheck={false}
    />
  );
};
