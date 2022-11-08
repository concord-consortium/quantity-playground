import React, { useState } from "react";

import { VariableChipList } from "../ui/variable-chip-list";
import { VariableType } from "../../models/variable";

import "./dialog.scss";

interface IListVariablesDialog {
  onClose: () => void;
  variables: VariableType[];
}
export const ListVariablesDialog = ({ onClose, variables }: IListVariablesDialog) => {
  const [selectedVariables, setSelectedVariables] = useState<VariableType[]>([]);
  const onChipClick = (variable: VariableType) => {
    let foundVariable = false;
    const newSV = [];
    selectedVariables.forEach(v => {
      if (v === variable) {
        foundVariable = true;
      } else {
        newSV.push(v);
      }
    });
    if (!foundVariable) newSV.push(variable);
    setSelectedVariables(newSV);
  };


  return (
    <div className="qp-dialog">
      <div className="dialog-button-row">
        <VariableChipList
          nameOnly={true}
          onClick={onChipClick}
          selectedVariables={selectedVariables}
          variables={variables}
        />
        <button className="dialog-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};
