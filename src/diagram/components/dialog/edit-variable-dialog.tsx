import React, { useState } from "react";
import { applySnapshot, getSnapshot } from "mobx-state-tree";
import { cloneDeep } from "lodash";

import { NormalDialogRow } from "./dialog";
import { VariableType } from "../../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters } from "../../utils/validate";

import "./dialog.scss";

interface IEditVariableDialogContent {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  unit: string;
  setUnit: React.Dispatch<React.SetStateAction<string>>;
}
export const EditVariableDialogContent = ({ name, setName, notes, setNotes, value, setValue, unit, setUnit }: IEditVariableDialogContent) => {
  return (
    <div className="dialog-content">
      <div>Edit Variable:</div>
      <NormalDialogRow
        label="Name"
        value={name}
        setValue={setName}
        maxCharacters={kMaxNameCharacters}
        width={230}
      />
      <NormalDialogRow
        label="Notes"
        value={notes}
        setValue={setNotes}
        maxCharacters={kMaxNotesCharacters}
        textarea={{ cols: 50, rows: 2 }}
      />
      <NormalDialogRow label="Units" value={unit} setValue={setUnit} width={230} />
      <NormalDialogRow label="Value" value={value} setValue={setValue} width={82} />
    </div>
  );
};

interface IUpdateVariable {
  variable: VariableType;
  name?: string;
  notes?: string;
  value?: string;
  unit?: string;
}
export const updateVariable = ({ variable, name, notes, value, unit}: IUpdateVariable) => {
  const copy = cloneDeep(getSnapshot(variable));
  copy.name = name === undefined ? copy.name : name;
  copy.description = notes === undefined ? copy.description : notes;
  // TODO validate new value
  copy.value = value === undefined ? copy.value : +value;
  copy.unit = unit === undefined ? copy.unit : unit;
  applySnapshot(variable, copy);
};

interface IEditVariableDialog {
  onClose: () => void;
  onSave: (updates: IUpdateVariable) => void;
  variable: VariableType;
}
export const EditVariableDialog = ({ onClose, onSave, variable }: IEditVariableDialog) => {
  const [name, setName] = useState(variable.name || "");
  const [notes, setNotes] = useState(variable.description || "");
  const [value, setValue] = useState(variable.value?.toString() || "");
  const [unit, setUnit] = useState(variable.unit || "");

  const handleOK = () => {
    onSave({ variable, name, notes, value, unit });
    onClose();
  };

  return (
    <div className="qp-dialog">
      <EditVariableDialogContent
        name={name} setName={setName}
        notes={notes} setNotes={setNotes}
        value={value} setValue={setValue}
        unit={unit} setUnit={setUnit}
      />
      <div className="dialog-button-row">
        <button className="dialog-button" onClick={onClose}>Cancel</button>
        <button className="dialog-button" onClick={handleOK}>OK</button>
      </div>
    </div>
  );
};
