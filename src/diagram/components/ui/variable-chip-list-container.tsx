import React from "react";

import { VariableChipList } from "./variable-chip-list";
import { VariableType } from "../../models/variable";
import { useSelectMultipleVariables } from "../../../hooks/use-select-multiple-variables";

import "./variable-chip-list-container.scss";

interface IVariableChipListContainer {
  variables: VariableType[];
}
export const VariableChipListContainer = ({ variables }: IVariableChipListContainer) => {
  const { selectedVariables, toggleVariable } = useSelectMultipleVariables();

  return (
    <div className="variable-chip-list-container">
      <VariableChipList
        onClick={toggleVariable}
        selectedVariables={selectedVariables}
        variables={variables}
      />
    </div>
  );
};
