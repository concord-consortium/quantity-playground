import React, { useEffect, useState } from "react";
import classNames from "classnames";

interface INumberInput {
  className?: string;
  dataTestId?: string;
  isValid: (value: string) => boolean;
  otherProps?: Record<string, any>;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
}
export const NumberInput = ({ className, dataTestId, isValid, otherProps, realValue, setRealValue }: INumberInput) => {
  const [value, setValue] = useState(realValue?.toString() || "");
  useEffect(() => {
    // We only update the display value when the real value is defined so the invalid state remains visible.
    // However, this results in a bug, because the variable card will not update when the value is changed to undefined
    // via some other method, such as a dialog.
    if (realValue !== undefined) {
      setValue(realValue?.toString() || "");
    }
  }, [realValue]);
  
  const onChange = (e: any) => {
    const val = e.target.value;
    if (isValid(val)) {
      setRealValue(+val);
    } else {
      setRealValue(undefined);
    }
    setValue(val);
  };
  const onBlur = () => setValue(realValue?.toString() || "");

  // We explicitly make "" valid here because it represents a variable with no specified value
  const invalid = value !== "" && !isValid(value);

  return <input className={classNames(className, { invalid })} data-testid={dataTestId} value={value} onChange={onChange} onBlur={onBlur} {...otherProps} />;
};
