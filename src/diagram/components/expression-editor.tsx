import React, { useEffect, useRef, useState } from "react";
import { VariableType } from "../models/variable";

import "./expression-editor.scss";

interface IProps {
  variable: VariableType
  onShowExpressionEditor: (show: boolean) => void;
}

export const ExpressionEditor: React.FC<IProps> = ({variable, onShowExpressionEditor}) => {
  const [appliedExpression, setAppliedExpression] = useState(variable.expression);
  const expressionEditorRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (expressionEditorRef?.current) {
      expressionEditorRef.current.style.height = "0px";
      const scrollHeight = expressionEditorRef.current.scrollHeight;
      expressionEditorRef.current.style.height = scrollHeight + "px";
    }
  }, [variable.expression]);

  const handleCloseEditor = () => {
    setAppliedExpression(variable.expression);
    onShowExpressionEditor(false);
  };
  const handleCancelEditor = () => {
    variable.setExpression(appliedExpression);
    onShowExpressionEditor(false);
  };

  const handleExpressionChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setExpression(undefined);
    } else {
      variable.setExpression(evt.target.value);
    }
  };

  const handleEnter = (evt: any) => {
    if (evt.key === "Enter") {
      handleCloseEditor();
    }
  };

  return (
    <div className={"expression-editor-dialog"}>
      <div className="title">Expression Editor</div>
      <div className="expression-editor-container">
        <div className="variable-name">{variable.name || "variable"}=</div>
        <textarea className="expression-editor"
                  ref={expressionEditorRef}
                  rows={1}
                  placeholder="expression"
                  value={variable.expression || ""}
                  onMouseDown={e => e.stopPropagation()}
                  onChange={handleExpressionChange}
                  onKeyDown={handleEnter}
        >
          {variable.expression || ""}
        </textarea>
      </div>
      <div className="footer-buttons">
        <button className="dialog-button" type="button" onClick={handleCancelEditor}>Cancel</button>
        <button className="dialog-button" type="button" onClick={handleCloseEditor}>Apply</button>
      </div>
    </div>
  );
};
