import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { applySnapshot, getSnapshot, IAnyComplexType, Instance } from "mobx-state-tree";
import classNames from "classnames";

import { NumberRow } from "./number-row";
import { TextRow } from "./text-row";
import { TextAreaRow } from "./text-area-row";
import { Variable, VariableType } from "../../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters, processName } from "../../utils/validate";
import { IconInputCard } from "./icon-input-card";
import { IconOutputCard } from "./icon-output-card";
import { ErrorMessageComponent } from "../error-message";

import "./dialog.scss";

export interface IEditVariableDialogContent {
  variable?: VariableType;
  variableClone: VariableType;
}

export const EditVariableDialogContent = observer(({ variable, variableClone }: IEditVariableDialogContent) => {
  // We use a clone of the variable for the form so the user can modify its properties, but those
  // changes won't be saved unless the Save button is pushed. However, because variableClone was created
  // from a snapshot, we will not be able to access any computed values related to the original variable's
  // inputs. We need to get those values from the original variable.
  const errorMessage = variable?.errorMessage;
  const isExpressionVariable = variable?.hasInputs;

  const updateName = (newName: string) => {
    variableClone.setName(processName(newName));
  };
  
  return (
    <div className={classNames("dialog-content", variableClone.color)}>
      <div className="dialog-content__col dialog-content__col-1">
        <TextRow
          inputId="evd-name"
          label="Variable Name"
          value={variableClone.name || ""}
          setValue={updateName}
          maxCharacters={kMaxNameCharacters}
        />
        <TextAreaRow
          cols={50}
          inputId="evd-notes"
          label="Notes"
          maxCharacters={kMaxNotesCharacters}
          rows={2}
          setValue={variableClone.setDescription}
          spellCheck={true}
          value={variableClone.description || ""}
        />
      </div>
      <div className={classNames("dialog-content__col dialog-content__col-2", { "is-expression-variable": isExpressionVariable })}>
        <TextAreaRow
          disabled={true}
          inputId="evd-expression"
          label="Expression"
          value={variableClone.expression || ""}
        />
        <TextAreaRow
          disabled={true}
          inputId="evd-calculation"
          label="Calculation"
          value={isExpressionVariable ? variable.calculationString || "" : ""}
        />
        <TextAreaRow
          disabled={isExpressionVariable}
          inputId="evd-units"
          label="Unit"
          maxCharacters={27}
          preventLineBreaks={true}
          value={isExpressionVariable ? variable.displayUnit || "" : variableClone.unit || ""}
          setValue={variableClone.setUnit}
        />
        <NumberRow
          disabled={isExpressionVariable}
          inputId="evd-value"
          label="Value"
          preventLineBreaks={true}
          realValue={isExpressionVariable ? variable?.displayValue : variableClone.value}
          setRealValue={variableClone.setValue}
        />
        <div className="dialog-error-messages">
          { errorMessage && <ErrorMessageComponent dialog={true} errorMessage={errorMessage} /> }
        </div>
      </div>
      <div className="variable-type-icon">
        { isExpressionVariable ? <IconOutputCard /> : <IconInputCard /> }
      </div>
    </div>
  );
});

// Copies data from copyVariable into variable
export const updateVariable = (variable: VariableType, copyVariable: VariableType) => {
  // Because copyVariable is created from a snapshot, it will not have any of the inputs 
  // that the original variable has. So we need to save the inputs, apply the snapshot,
  // and then re-attach the inputs.
  const inputs = [...variable.inputs];
  applySnapshot(variable, getSnapshot(copyVariable));
  for (const input of inputs) {
    variable.addInput(input as Instance<IAnyComplexType>);
  }
};

interface IEditVariableDialog {
  onClose: () => void;
  variable: VariableType;
}

export const EditVariableDialog = ({ onClose, variable }: IEditVariableDialog) => {
  const variableClone = useMemo(() => Variable.create(getSnapshot(variable)), [variable]);

  const handleOK = () => {
    updateVariable(variable, variableClone);
    onClose();
  };

  return (
    <div className={classNames("qp-dialog", variable.color)}>
      <EditVariableDialogContent variable={variable} variableClone={variableClone} />
      <div className="dialog-button-row">
        <button className="dialog-button cancel" onClick={onClose}>Cancel</button>
        <button className="dialog-button save" onClick={handleOK}>Save</button>
      </div>
    </div>
  );
};
