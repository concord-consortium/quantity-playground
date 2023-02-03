import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { applySnapshot, getSnapshot, IAnyComplexType, Instance } from "mobx-state-tree";
import { NumberRow } from "./number-row";
import { TextRow } from "./text-row";
import { TextAreaRow } from "./text-area-row";
import { Variable, VariableType } from "../../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters, processName } from "../../utils/validate";
import classNames from "classnames";
import { IconInputCard } from "./icon-input-card";
import { IconOutputCard } from "./icon-output-card";
import { ErrorMessage } from "../error-message";

import "./dialog.scss";

interface IEditVariableDialogContent {
  calculationString?: string;
  errorMessage?: string;
  hasInputs?: boolean;
  variable: VariableType;
}

export const EditVariableDialogContent = observer(({
  calculationString, errorMessage, hasInputs, variable
}: IEditVariableDialogContent) => {
  const displayValue = hasInputs ? variable.computedValue : variable.value;
  const displayUnit = hasInputs ? variable.computedUnit : variable.unit;
  const calculation = hasInputs ? calculationString : "";

  const updateName = (newName: string) => {
    variable.setName(processName(newName));
  };
  
  return (
    <div className={classNames("dialog-content", variable.color)}>
      <div className="dialog-content__col dialog-content__col-1">
        <TextRow
          inputId="evd-name"
          label="Variable Name"
          value={variable.name || ""}
          setValue={updateName}
          maxCharacters={kMaxNameCharacters}
        />
        <TextAreaRow
          cols={50}
          inputId="evd-notes"
          label="Notes"
          maxCharacters={kMaxNotesCharacters}
          rows={2}
          setValue={variable.setDescription}
          spellCheck={true}
          value={variable.description || ""}
        />
      </div>
      <div className={classNames("dialog-content__col dialog-content__col-2", { "is-output-variable": hasInputs })}>
        <TextAreaRow
          disabled={true}
          inputId="evd-expression"
          label="Expression"
          value={variable.expression || ""}
        />
        <TextAreaRow
          disabled={true}
          inputId="evd-calculation"
          label="Calculation"
          value={calculation || ""}
        />
        <TextAreaRow
          disabled={hasInputs}
          inputId="evd-units"
          label="Unit"
          value={displayUnit || ""}
          setValue={variable.setUnit}
        />
        <NumberRow
          disabled={hasInputs}
          inputId="evd-value"
          label="Value"
          realValue={displayValue}
          setRealValue={variable.setValue}
        />
        <div className="dialog-error-messages">
          { errorMessage && <ErrorMessage valueError={errorMessage} /> }
        </div>
      </div>
      <div className="variable-type-icon">
        { hasInputs ? <IconOutputCard /> : <IconInputCard /> }
      </div>
    </div>
  );
});

// Copies data from copyVariable into variable
export const updateVariable = (variable: VariableType, copyVariable: VariableType) => {
  // Because copyVariabe is created from a snapshot, it will not have any of the inputs 
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
  const hasInputs = variable.numberOfInputs > 0;
  const hasExpression = !!variableClone.expression;

  // Because variableClone was created from a snapshot, we will not be able to access 
  // computed values related to the original variable's inputs. We need to get those values
  // from the original variable and either update variableClone or pass the values to the
  // EditVariableDialogContent component separately.
  const calculationString = variable.calculationString;
  const errorMessage = variable?.computedValueError || variable?.computedUnitError || variable?.computedUnitMessage;
  if (hasExpression) {
    const value = variable.computedValue ? variable.computedValue : variable.computedValueWithSignificantDigits;
    variableClone.setValue(Number(value));
    variableClone.setUnit(variable.computedUnit);
  }

  const handleOK = () => {
    updateVariable(variable, variableClone);
    onClose();
  };

  return (
    <div className={classNames("qp-dialog", variable.color)}>
      <EditVariableDialogContent
        calculationString={calculationString}
        errorMessage={errorMessage}
        hasInputs={hasInputs}
        variable={variableClone}
      />
      <div className="dialog-button-row">
        <button className="dialog-button cancel" onClick={onClose}>Cancel</button>
        <button className="dialog-button save" onClick={handleOK}>Save</button>
      </div>
    </div>
  );
};
