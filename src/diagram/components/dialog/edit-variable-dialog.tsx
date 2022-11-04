import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { NumberRow } from "./number-row";
import { TextRow } from "./text-row";
import { TextAreaRow } from "./text-area-row";
import { Variable, VariableType } from "../../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters } from "../../utils/validate";

import "./dialog.scss";

interface IEditVariableDialogContent {
  variable: VariableType;
}
export const EditVariableDialogContent = observer(({ variable }: IEditVariableDialogContent) => {
  const updateName = (newName: string) => {
    variable.setName(newName.replace(" ", ""));
  };
  
  return (
    <div className="dialog-content">
      <div>Edit Variable:</div>
      <TextRow
        inputId="evd-name"
        label="Name"
        value={variable.name || ""}
        setValue={updateName}
        maxCharacters={kMaxNameCharacters}
        width={230}
      />
      <TextAreaRow
        cols={50}
        inputId="evd-notes"
        label="Notes"
        maxCharacters={kMaxNotesCharacters}
        rows={2}
        setValue={variable.setDescription}
        value={variable.description || ""}
      />
      <TextRow inputId="evd-units" label="Units" value={variable.unit || ""} setValue={variable.setUnit} width={230} />
      <NumberRow inputId="evd-value" label="Value" realValue={variable.value} setRealValue={variable.setValue} width={82} />
    </div>
  );
});

// Copies data from copyVariable into variable
export const updateVariable = (variable: VariableType, copyVariable: VariableType) => {
  applySnapshot(variable, getSnapshot(copyVariable));
};

interface IEditVariableDialog {
  onClose: () => void;
  onSave: (variable: VariableType, copyVariable: VariableType) => void;
  variable: VariableType;
}
export const EditVariableDialog = ({ onClose, onSave, variable }: IEditVariableDialog) => {
  const variableClone = useMemo(() => Variable.create(getSnapshot(variable)), [variable]);

  const handleOK = () => {
    onSave(variable, variableClone);
    onClose();
  };

  return (
    <div className="qp-dialog">
      <EditVariableDialogContent variable={variableClone} />
      <div className="dialog-button-row">
        <button className="dialog-button" onClick={onClose}>Cancel</button>
        <button className="dialog-button" onClick={handleOK}>OK</button>
      </div>
    </div>
  );
};
