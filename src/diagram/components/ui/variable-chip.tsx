import { observer } from "mobx-react-lite";
import React from "react";

import { VariableType } from "../../models/variable";

import "./variables-chip.scss";

export const kEmptyVariable = "<no name>";

interface IProps {
  variable: VariableType;
}

export const VariableChip = observer(({variable}: IProps) => {
  const name = variable.name;
  const value = variable.computedValue;
  const valueString = variable.computedValueWithSignificantDigits;
  const unit = variable.computedUnit || "";
  const showValue = value !== undefined && !isNaN(value);
  const showEquals = showValue && name;
  const wrapUnit = !showValue;

  if (!name && !showValue && !unit) {
    return <span className="variable-name">{kEmptyVariable}</span>;
  }

  return (
    <>
      {name && <span className="variable-name">{name}</span>}
      {showEquals && <span className="variable-equals">=</span>}
      {showValue && <span className="variable-value">{valueString}</span>}
      {unit &&
        <>
          {wrapUnit && "("}
            <span className="variable-unit">{unit}</span>
          {wrapUnit && ")"}
        </>
      }
    </>
  );
});
VariableChip.displayName = "VariableChip";
