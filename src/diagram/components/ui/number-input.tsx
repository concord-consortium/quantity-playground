import React, { useState } from "react";
import classNames from "classnames";

interface INumberInput {
  className?: string;
  isValid: (value: string) => boolean;
  otherProps?: Record<string, any>;
  realValue?: number;
  setRealValue: (value: number) => void;
}
export const NumberInput = ({ className, isValid, otherProps, realValue, setRealValue }: INumberInput) => {
  const [value, setValue] = useState(realValue?.toString() || "");
  const onChange = (e: any) => {
    const val = e.target.value;
    if (isValid(val)) {
      setRealValue(+val);
    }
    setValue(val);
  };
  const onBlur = () => setValue(realValue?.toString() || "");
  const invalid = !isValid(value);

  return <input className={classNames(className, { invalid })} value={value} onChange={onChange} onBlur={onBlur} {...otherProps} />;
};
