import { useState } from "react";
import { VariableType } from "../diagram";

export const useSelectMultipleVariables = () => {
  const [selectedVariables, setSelectedVariables] = useState<VariableType[]>([]);

  const clearSelectedVariables = () => setSelectedVariables([]);

  const toggleVariable = (variable: VariableType) => {
    let found = false;
    const newSV = [];
    selectedVariables.forEach(v => {
      if (v === variable) {
        found = true;
      } else {
        newSV.push(v);
      }
    });
    if (!found) newSV.push(variable);
    setSelectedVariables(newSV);
  };

  return { clearSelectedVariables, selectedVariables, toggleVariable };
};
