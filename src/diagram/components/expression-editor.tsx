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

  // from https://usehooks.com/usePrevious/
  const usePrevious = (value: string | undefined) => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref: any = useRef();
  // Store current value in ref
  useEffect(() => {
      ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
  };
  const prevExpression = usePrevious(appliedExpression);

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
    if (prevExpression !== undefined) {
      variable.setExpression(prevExpression);
    } else {
      variable.setExpression(undefined);
    }
    onShowExpressionEditor(false);
  };

  const handleExpressionChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setExpression(undefined);
    } else {
      variable.setExpression(evt.target.value);
    }
  };

  return (
    <div className={"expression-editor-dialog"}>
      <div className="title">Expression Editor</div>
      <div className="expression-editor-container">
        <textarea className="expression-editor"
                  ref={expressionEditorRef}
                  rows={1}
                  placeholder="expression"
                  value={variable.expression || ""}
                  onMouseDown={e => e.stopPropagation()}
                  onChange={handleExpressionChange}
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
