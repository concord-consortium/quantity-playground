import React, { useEffect, useState } from "react";
import classNames from "classnames";

interface INumberInput {
  className?: string;
  dataTestId?: string;
  isValid: (value: string) => boolean;
  otherProps?: Record<string, any>;
  realValue?: number;
  setRealValue: (value: number) => void;
}
export const NumberInput = ({ className, dataTestId, isValid, otherProps, realValue, setRealValue }: INumberInput) => {
  const [value, setValue] = useState(realValue?.toString() || "");
  useEffect(() => {
    setValue(realValue?.toString() || "");
  }, [realValue]);
  
  const onChange = (e: any) => {
    const val = e.target.value;
    if (isValid(val)) {
      setRealValue(+val);
    }
    setValue(val);
  };
  const onBlur = () => setValue(realValue?.toString() || "");
  const invalid = !isValid(value);

  return <input className={classNames(className, { invalid })} data-testid={dataTestId} value={value} onChange={onChange} onBlur={onBlur} {...otherProps} />;
};
