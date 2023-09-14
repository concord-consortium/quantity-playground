import Slider from "rc-slider";
import React from "react";

import { VariableType } from "../../models/variable";

import "rc-slider/assets/index.css";

interface IVariableSliderProps {
  className?: string;
  max: number;
  min: number;
  step: number;
  variable?: VariableType;
}
export function VariableSlider({ className, max, min, step, variable}: IVariableSliderProps) {
  const handleChange = (value: number | number[]) =>
    variable?.setTemporaryValue(Array.isArray(value) ? value[0] : value);
  const handleAfterChange = (value: number | number[]) => variable?.commitTemporaryValue();
  return (
    <Slider
      className={className}
      max={max}
      min={min}
      onAfterChange={handleAfterChange}
      onChange={handleChange}
      step={step}
      value={variable?.currentValue ?? min}
    />
  );
}
