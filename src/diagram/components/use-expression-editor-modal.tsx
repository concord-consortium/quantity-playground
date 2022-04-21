// import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";
import { useModal } from "react-modal-hook";
import classNames from "classnames";
import { VariableType } from "../models/variable";

import "./expression-editor.scss";

// constant for use as return value from client onClick handlers
export const kLeaveModalOpen = true;

interface IModalButton {
  className?: string;
  label: string | React.FC<any>;
  isDefault?: boolean;
  isDisabled?: boolean;
  onClick?: (() => void) | (() => boolean); // close dialog on falsy return value
}

interface IProps {
  focusElement?: string;
  variable: VariableType;
  onShowExpressionEditor?: (show: boolean) => void;
}

const invokeButton = (button: IModalButton, onClose: () => void) => {
  // close dialog on falsy return value from onClick
  !button.isDisabled && !button.onClick?.() && onClose();
};

export const useExpressionEditorModal = ({
  focusElement, variable, onShowExpressionEditor
}: IProps, dependencies?: any[]) => {
  const [appliedExpression, setAppliedExpression] = useState(variable.expression);
  const expressionEditorTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (expressionEditorTextAreaRef?.current) {
      expressionEditorTextAreaRef.current.style.height = "0px";
      const scrollHeight = expressionEditorTextAreaRef.current.scrollHeight;
      expressionEditorTextAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [variable.expression]);

  const buttons: IModalButton[] = useMemo(() => {
    const handleCancelEditor = () => {
      variable.setExpression(appliedExpression);
    };
    const handleCloseEditor = () => {
      setAppliedExpression(variable.expression);
    };

    return [
      {label: "Cancel", onClick: handleCancelEditor},
      {label: "Apply", isDefault: true, onClick: handleCloseEditor}
      ];
  }, [appliedExpression, variable]);


  const handleExpressionChange = (evt: any) => {
    variable.setExpression(evt.target.value || undefined);
  };

  // const handleDeleteEditor = () => {
  //   variable.setExpression(undefined);
  //   onShowExpressionEditor(true);
  // };

  // const handleKeyDown = (evt: any) => {
  //   evt.stopPropagation();
  //   switch (evt.key) {
  //     case "Enter":
  //       handleCloseEditor();
  //       break;
  //     case "Escape":
  //       handleCancelEditor();
  //       break;
  //     case "Delete":
  //       handleDeleteEditor();
  //       break;
  //     case "Backspace":
  //       handleDeleteEditor();
  //       break;
  //   }
  // };

  const contentElt = useRef<HTMLDivElement>();
  const hideModalRef = useRef<() => void>();
  const handleCloseRef = useRef<() => void>(() => hideModalRef.current?.());

  // const handleCloseEditor = useMemo(() => {
  //   setAppliedExpression(variable.expression);
  //   // onShowExpressionEditor(false);
  // }, [onShowExpressionEditor, variable.expression]);

  // const handleCloseEditor = useCallback(() => {
  //   setAppliedExpression(variable.expression);
  //   contentElt.current?.removeEventListener("keydown", handleKeyDown, true);
  //   hideModalRef.current?.();
  // }, [handleKeyDown, variable.expression]);
  // handleCloseRef.current = handleCloseEditor;

  const blurModal = useCallback(() => {
    // focusing the content element blurs any input control
    contentElt.current?.focus();
  }, []);

  const handleAfterOpen = ({overlayEl, contentEl}: { overlayEl: Element, contentEl: HTMLDivElement }) => {
    contentElt.current = contentEl;

    contentEl.addEventListener("keydown", handleKeyDown, true);

    const element = focusElement && contentEl.querySelector(focusElement) as HTMLElement || contentEl;
    element && setTimeout(() => {
      element.focus?.();
      (element as HTMLInputElement).select?.();
    });
  };

  // defined left-to-right, e.g. Extra Button, Cancel, OK


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const defaultButton = buttons.find(b => b.isDefault);
      if (defaultButton && !defaultButton.isDisabled) {
        blurModal();
        // useRef to avoid circular dependencies
        invokeButton(defaultButton, handleCloseRef.current);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, [blurModal, buttons, handleCloseRef]);

  const handleClose = useCallback(() => {
    setAppliedExpression(variable.expression);
    contentElt.current?.removeEventListener("keydown", handleKeyDown, true);
    hideModalRef.current?.();
  }, [handleKeyDown, variable.expression]);
  handleCloseRef.current = handleClose;

  const [showModal, hideModal] = useModal(() => {
    return (
      <Modal className={`expression-editor-dialog`} isOpen
              shouldCloseOnEsc={true}
              shouldCloseOnOverlayClick={true}
              onAfterOpen={handleAfterOpen as any}
              // onRequestClose={handleClose}
              // onAfterClose={()=>onShowExpressionEditor(false)}
      >
        <div className="modal-header">
          <div className="title">Expression Editor</div>
        </div>
        <div className="expression-editor-container">
          <div className="variable-name">{variable.name || "variable"}=</div>
          <textarea className="expression-editor"
                    ref={expressionEditorTextAreaRef}
                    rows={1}
                    placeholder="expression"
                    value={variable.expression || ""}
                    data-testid="expression-editor-input-field"
                    onMouseDown={e => e.stopPropagation()}
                    onChange={handleExpressionChange}
          >
            {variable.expression || ""}
          </textarea>
        </div>
        <div className="footer-buttons">
          {buttons.map((b, i) => {
            const classes = classNames("dialog-button", b.className, { default: b.isDefault, disabled: b.isDisabled });
            const key = `${i}-${b.className}`;
            const handleClick = () => invokeButton(b, handleClose);
            return (
              <button type="button" className={classes} key={key} onClick={handleClick}>
                {b.label}
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }, dependencies);
  hideModalRef.current = hideModal;

  return [showModal, handleClose, blurModal];
};
