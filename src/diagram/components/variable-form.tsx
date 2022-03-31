import { observer } from "mobx-react-lite";
import React from "react";
import { Operation, VariableType } from "../models/variable";

interface IProps {
    variable: VariableType;
}
  
const _VariableForm: React.FC<IProps> = ({ variable }) => {
  const onValueChange = (evt: any) => {
    // if the value is null or undefined or empty just store undefined
    if (evt.target.value == null || evt.target.value === "") {
      variable.setValue(undefined);
    } else {
      // If the value is the empty string parseFloat turns that into NaN which
      // we want to avoid.
      variable.setValue(parseFloat(evt.target.value));
    }
  };

  const onUnitChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setUnit(undefined);
    } else {
      variable.setUnit(evt.target.value);
    }
  };

  const onNameChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setName(undefined);
    } else {
      variable.setName(evt.target.value);
    }
  };

  const onOperationChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setOperation(undefined);
    } else {
      variable.setOperation(evt.target.value);
    }
  };

  return (
    <div style={{zIndex: 4, position: "absolute"}}>
      <div>
        <label>name:
          <input value={variable.name || ""} onChange={onNameChange}/>
        </label>
      </div>
      <div>
        <label>value:
          <input type="number" value={variable.value ?? ""} onChange={onValueChange}/>
        </label>
      </div>
      <div>
        <label>unit:
          <input value={variable.unit || ""} onChange={onUnitChange}/>
        </label>
      </div>
      <div>
        <label>operation:
          <select value={variable.operation || ""} onChange={onOperationChange}>
            { // in an enumeration the keys are the names and the values are string or 
              // numeric identifier
            }
            <option key="none" value="">none</option>
            {Object.entries(Operation).map(([name, symbol]) => 
              <option key={symbol} value={symbol}>{name}</option>
            )}
          </select>
        </label>
      </div>
    </div>
  );
};

export const VariableForm = observer(_VariableForm);
VariableForm.displayName = "VariableForm";
