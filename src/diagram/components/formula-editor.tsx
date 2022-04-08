import React from "react";

import { VariableType } from "../models/variable";

import "./formula-editor.scss";

interface IProps {
  variable: VariableType
  onShowFormulaEditor: (show: boolean) => void;
}

export const FormulaEditor: React.FC<IProps> = ({variable, onShowFormulaEditor}) => {
  const handleCloseEditor = () => {
    onShowFormulaEditor(false);
  };
  const handleCancelEditor = () => {
    variable.setFormula(undefined);
    onShowFormulaEditor(false);
  };

  const handleExpressionChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setFormula(undefined);
    } else {
      variable.setFormula(evt.target.value);
    }
  };
  console.log(variable);

  return (
    <div className={"formula-editor-dialog"}>
      <div className="title">Formula Editor</div>
      <div className="formula-editor-container">
        <textarea className="formula-editor" rows={5} placeholder="formula" value={variable.formula || ""}
          onMouseDown={e => e.stopPropagation()} onChange={handleExpressionChange}>
          {variable.formula || ""}
        </textarea>
      </div>
      <div className="footer-buttons">
        <button className="dialog-button" type="button" onClick={handleCancelEditor}>Cancel</button>
        <button className="dialog-button" type="button" onClick={handleCloseEditor}>Apply</button>
      </div>
    </div>
  );
};
