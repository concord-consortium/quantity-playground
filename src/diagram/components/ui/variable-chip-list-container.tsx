import React, { useState } from "react";

import { VariableChipList } from "./variable-chip-list";
import { VariableType } from "../../models/variable";

import "./variable-chip-list-container.scss";

interface IVariableChipListContainer {
  variables: VariableType[];
}
export const VariableChipListContainer = ({ variables }: IVariableChipListContainer) => {
  const [selectedVariables, setSelectedVariables] = useState<VariableType[]>([]);

  const onClick = (variable: VariableType) => {
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

  return (
    <div className="variable-chip-list-container">
      <VariableChipList
        onClick={onClick}
        selectedVariables={selectedVariables}
        variables={variables}
      />
    </div>
  );
};
