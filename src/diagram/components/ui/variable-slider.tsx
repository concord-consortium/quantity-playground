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
  // Called once a change completes (on release), after the value is committed, with the variable.
  // Lets consumers react to a committed change (e.g. logging) without the slider hard-coding it.
  onChangeComplete?: (variable: VariableType) => void;
}
export function VariableSlider({ className, max, min, step, variable, onChangeComplete}: IVariableSliderProps) {
  const handleChange = (value: number | number[]) =>
    variable?.setTemporaryValue(Array.isArray(value) ? value[0] : value);
  const handleAfterChange = () => {
    if (variable) {
      variable.commitTemporaryValue();
      onChangeComplete?.(variable);
    }
  };
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
