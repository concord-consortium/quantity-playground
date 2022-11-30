import React, { useEffect, useState } from "react";
import classNames from "classnames";

interface INumberInput {
  className?: string;
  dataTestId?: string;
  isValid: (value: string) => boolean;
  otherProps?: Record<string, any>;
  realValue?: number;
  setRealValue: (value: number | undefined) => void;
  unsetSelectedNode?: () => void;
}

export const NumberInput = ({ className, dataTestId, isValid, otherProps, realValue, setRealValue, unsetSelectedNode }: INumberInput) => {
  const [value, setValue] = useState(realValue?.toString() || "");
  useEffect(() => {
    setValue(realValue?.toString() || "");
  }, [realValue]);
  
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  const onBlur = () => {
    if (value === "" || !isValid(value)) {
      setRealValue(undefined);
    } else {
      setRealValue(+value);
    }
    if (unsetSelectedNode) {
      unsetSelectedNode();
    }
  };

  // We explicitly make "" valid here because it represents a variable with no specified value
  const invalid = value !== "" && !isValid(value);

  return <input className={classNames(className, { invalid })} data-testid={dataTestId} value={value} onChange={onChange} onBlur={onBlur} {...otherProps} />;
};
