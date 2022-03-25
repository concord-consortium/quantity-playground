import { observer } from "mobx-react-lite";
import React from "react";
import { VariableType } from "../models/variable";

interface IVariableProps {
  variable?: VariableType;
  final?: boolean;
  symbolic?: boolean;
}
  
const _NestedSetVariable: React.FC<IVariableProps> = ({ variable, final, symbolic }) => {
  if (!variable) {
    return <>?</>;
  }
  
  const variableString = () => {
      if (symbolic) {
        return variable.name || "";
      } else {
        const unit = variable.computedUnit;
        const suffix = unit ? ` ${unit}` : "";
        return `${variable.computedValueWithSignificantDigits}${suffix}`;
      }
  };

  const renderContent = () => {
      if (variable.operation ) {
        return (
        <>
          <NestedSetVariable variable={variable.inputA as VariableType | undefined} symbolic={symbolic}/> 
          {variable.operation} 
          <NestedSetVariable variable={variable.inputB as VariableType | undefined} symbolic={symbolic}/>
        </>);
      } else if (variable.numberOfInputs === 1) {
        // This is a tricky case if there is no unit conversion then it is basically a no-op but 
        // it is still useful to draw a box around the single input. That is because this box
        // represents a node
        // If there is a unit conversion then what do we draw. What it really is is a multiplication
        // by a factor, in symbolic representation we could say " * conversionFactor "
        const input = variable.firstValidInput;
        return (        
          <NestedSetVariable variable={input as VariableType | undefined} symbolic={symbolic}/>
        );
      } else {
        return variableString();
      }
  };

  return (
    <div className="nested-set-node">
      {renderContent()}
      {/* probably want at least 2 modes variables and quantities */}
      {final && ` =  ${variableString()}` }
    </div>
  );
};

const NestedSetVariable = observer(_NestedSetVariable);
NestedSetVariable.displayName = "NestedSetVariable";

interface IProps {
    // this caused an error for some reason
    // node?: Instance<typeof DQNode>;
    variable?: VariableType;
    final?: boolean;
    symbolic?: boolean;
}

const _NestedSet: React.FC<IProps> = ({ variable, final, symbolic }) => {
    return (
    <>
      <div style={{paddingBottom: "5px"}}>
        <NestedSetVariable variable={variable} final={final} symbolic={true}/>
      </div>
      <div>
        <NestedSetVariable variable={variable} final={final} symbolic={false}/>
      </div>
    </>);
};
export const NestedSet = observer(_NestedSet);
NestedSet.displayName = "NestedSet";
