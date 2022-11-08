import React from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";

import { VariableType } from "../../models/variable";

import "./variable-chip.scss";

export const kEmptyVariable = "<no name>";

interface IVariableChip {
  nameOnly?: boolean;
  onClick?: (variable: VariableType) => void;
  selected?: boolean;
  variable: VariableType;
}

export const VariableChip = observer(({ nameOnly, onClick, selected, variable }: IVariableChip) => {
  const name = variable.name;
  const value = variable.computedValue;
  const valueString = variable.computedValueWithSignificantDigits;
  const unit = variable.computedUnit || "";
  const showValue = value !== undefined && !isNaN(value);
  const showEquals = showValue && name;
  const wrapUnit = !showValue;

  const className = classNames("variable-chip", { selected });

  return (
    <span className={className} onClick={e => onClick?.(variable)} >
      {!name && !showValue && !unit
        ? <span className="variable-name">{kEmptyVariable}</span>
        : (
          <>
            {name && <span className="variable-name">{name}</span>}
            {(!nameOnly || !name) &&
              <>
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
            }
          </>
        )
      }
    </span>
  );
});
VariableChip.displayName = "VariableChip";
