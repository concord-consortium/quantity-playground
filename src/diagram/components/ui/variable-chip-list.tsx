import React from "react";

import { VariableChip } from "./variable-chip";
import { VariableType } from "../../models/variable";

import "./variable-chip-list.scss";

interface IVariableChipList {
  className?: string;
  nameOnly?: boolean;
  onClick?: (variable: VariableType) => void;
  selectedVariables?: VariableType | VariableType[];
  variables: VariableType[];
}
export const VariableChipList = ({ className, nameOnly, onClick, selectedVariables, variables }: IVariableChipList) => {
  return (
    <div className="variable-chip-list">
      {
        variables.map(variable => {
          const selected = Array.isArray(selectedVariables)
            ? selectedVariables.includes(variable)
            : selectedVariables === variable;
          return <VariableChip
            className={className}
            key={variable.id}
            nameOnly={nameOnly}
            onClick={onClick}
            selected={selected}
            variable={variable}
          />;
        })
      }
    </div>
  );
};
