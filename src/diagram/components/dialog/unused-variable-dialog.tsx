import React from "react";
import { observer } from "mobx-react-lite";

import { VariableChipList } from "../ui/variable-chip-list";
import { DQRootType } from "../../models/dq-root";
import { useSelectMultipleVariables } from "../../../hooks/use-select-multiple-variables";

import "./dialog.scss";

interface IUnusedVariableDialog {
  onClose: () => void;
  root: DQRootType;
}
export const UnusedVariableDialog =
  observer(function UnusedVariableDialog({ onClose, root }: IUnusedVariableDialog) {
    const { selectedVariables, toggleVariable } = useSelectMultipleVariables();

  const handleOK = () => {
    selectedVariables.forEach(variable => {
      root.variablesAPI?.removeVariable(variable);
    });
    onClose();
  };

  return (
    <div className="qp-dialog">
      <VariableChipList onClick={toggleVariable} selectedVariables={selectedVariables} variables={root.unusedVariables} />
      <div className="dialog-button-row">
        <button className="dialog-button" onClick={onClose}>Cancel</button>
        <button className="dialog-button" onClick={handleOK}>Permanently Remove</button>
      </div>
    </div>
  );
});
