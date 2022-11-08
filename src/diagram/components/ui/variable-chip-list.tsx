import React from "react";

import { VariableChip } from "./variable-chip";
import { VariableType } from "../../models/variable";

import "./variable-chip-list.scss";

interface IVariableChipList {
  nameOnly?: boolean;
  onClick?: (variable: VariableType) => void;
  selectedVariable?: VariableType;
  variables: VariableType[];
}
export const VariableChipList = ({ nameOnly, onClick, selectedVariable, variables }: IVariableChipList) => {
  return (
    <div className="variable-chip-list">
      {
        variables.map(variable => (
          <VariableChip
            key={variable.id}
            nameOnly={nameOnly}
            onClick={onClick}
            selected={selectedVariable === variable}
            variable={variable}
          />
        ))
      }
    </div>
  );
};
