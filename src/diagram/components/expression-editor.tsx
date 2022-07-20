import React, { useEffect, useRef, useState } from "react";
import { useClickAway } from "../../hooks/use-click-away";
import { VariableType } from "../models/variable";

import "./expression-editor.scss";

interface IProps {
  variable: VariableType
  onShowExpressionEditor: (show: boolean) => void;
}

export const ExpressionEditor: React.FC<IProps> = ({variable, onShowExpressionEditor}) => {
  const [appliedExpression, setAppliedExpression] = useState(variable.expression);
  const expressionEditorTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // This is needed to capture keyboard events for user is outside the textarea and uses the delete key.
  // Without it, the current node is deleted along with the expression editor.
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  });

  useEffect(() => {
    if (expressionEditorTextAreaRef?.current) {
      expressionEditorTextAreaRef.current.style.height = "0px";
      const scrollHeight = expressionEditorTextAreaRef.current.scrollHeight;
      expressionEditorTextAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [variable.expression]);

  const handleCloseEditor = () => {
    setAppliedExpression(variable.expression);
    onShowExpressionEditor(false);
  };
  const expressionEditorDialogRef = useClickAway(handleCloseEditor);

  const handleCancelEditor = () => {
    variable.setExpression(appliedExpression);
    onShowExpressionEditor(false);
  };

  const handleExpressionChange = (evt: any) => {
    variable.setExpression(evt.target.value || undefined);
  };

  const handleKeyDown = (evt: any) => {
    evt.stopPropagation();
    switch (evt.key) {
      case "Enter":
        handleCloseEditor();
        break;
      case "Escape":
        handleCancelEditor();
        break;
    }
  };

  return (
    <div ref={expressionEditorDialogRef} className={"expression-editor-dialog"} data-testid="expression-editor-dialog">
      <div className="title">Expression Editor</div>
      <div className="expression-editor-container" style={{background:variable.color}}>
        <div className="variable-name">{variable.name || "variable"}=</div>
        <textarea className="expression-editor"
                  ref={expressionEditorTextAreaRef}
                  rows={1}
                  placeholder="expression"
                  value={variable.expression || ""}
                  data-testid="expression-editor-input-field"
                  onMouseDown={e => e.stopPropagation()}
                  onChange={handleExpressionChange}
                  onKeyDown={handleKeyDown}
        >
          {variable.expression || ""}
        </textarea>
      </div>
      <div className="footer-buttons" style={{background:variable.color}}>
        <button className="dialog-button" data-testid="expression-editor-cancel-button" type="button" onClick={handleCancelEditor}>Cancel</button>
        <button className="dialog-button" data-testid="expression-editor-apply-button" type="button" onClick={handleCloseEditor}>Apply</button>
      </div>
    </div>
  );
};
