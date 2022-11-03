import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { DialogRow } from "./dialog-row";
import { Variable, VariableType } from "../../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters } from "../../utils/validate";

import "./dialog.scss";

const validNumber = (v: string) => !isNaN(+v);

interface IEditVariableDialogContent {
  variable: VariableType;
}
export const EditVariableDialogContent = observer(({ variable }: IEditVariableDialogContent) => {
  const updateName = (newName: string) => {
    variable.setName(newName.replace(" ", ""));
  };

  const [value, setValue] = useState(variable.value?.toString());
  const updateValue = (newValue: string) => {
    setValue(newValue);
    if (validNumber(newValue)) {
      variable.setValue(+newValue);
    }
  };
  
  return (
    <div className="dialog-content">
      <div>Edit Variable:</div>
      <DialogRow
        inputId="evd-name"
        label="Name"
        value={variable.name || ""}
        setValue={updateName}
        maxCharacters={kMaxNameCharacters}
        width={230}
      />
      <DialogRow
        inputId="evd-notes"
        label="Notes"
        value={variable.description || ""}
        setValue={variable.setDescription}
        maxCharacters={kMaxNotesCharacters}
        textarea={{ cols: 50, rows: 2 }}
      />
      <DialogRow inputId="evd-units" label="Units" value={variable.unit || ""} setValue={variable.setUnit} width={230} />
      <DialogRow inputId="evd-value" invalid={!validNumber(value || "")} label="Value" value={value || ""} setValue={updateValue} width={82} />
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
