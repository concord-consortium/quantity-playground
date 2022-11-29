import React, { ChangeEvent, FocusEvent, MouseEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import { Handle, Position } from "react-flow-renderer/nocss";
import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import { ColorEditor } from "./color-editor";
import { NumberInput } from "./ui/number-input";
import { DQNodeType } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";
import { kMaxNameCharacters, kMaxNotesCharacters, processName, isValidNumber } from "../utils/validate";
import { IconColorMenu } from "./icon-color-menu";
import { IconExpand } from "./icon-expand";
import { IconWarning } from "./icon-warning";

import "./quantity-node.scss";

interface IProps {
  data: {node: DQNodeType, dqRoot: DQRootType};
  isConnectable: boolean;
}

const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
  const [showColorEditor, setShowColorEditor] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showExpression, setShowExpression] = useState(false);

  const variable = data.node.variable;

  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  if (!isAlive(data.node) || !data.node.tryVariable) {
      return null;
  }

  const hasExpression = variable.numberOfInputs > 0;
  const hasLongExpression = variable.expression && variable.expression.length > 20;
  const hasError = variable.computedValueError || variable.computedUnitError || variable.computedUnitMessage;
  const shownValue = hasExpression ? variable.computedValue?.toString() || "" : variable.value;
  const shownUnit = hasExpression ? variable.computedUnit : variable.unit;

  const handleEditColor = () => {
    setShowColorEditor(!showColorEditor);
  };

  const handleShowDescription = () => {
    setShowDescription(!showDescription);
  };

  const handleShowExpression = () => {
    setShowExpression(!showExpression);
  };

  const onUnitChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.value) {
      variable.setUnit(undefined);
    } else {
      variable.setUnit(evt.target.value);
    }
  };

  const onNameChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.value) {
      variable.setName(undefined);
    } else {
      variable.setName(processName(evt.target.value));
    }
  };

  const onExpressionChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    if (!evt.target.value) {
      variable.setExpression(undefined);
      setShowExpression(false);
    } else {
      if (hasLongExpression) {
        setShowExpression(true);
      } else {
        setShowExpression(false);
      }
      variable.setExpression(evt.target.value);
    }
  };

  const handleExpressionKeyDown = (evt: any) => {
    if (evt.key === "Enter" || evt.key === "Escape") {
      evt.preventDefault();
      evt.stopPropagation();
      onExpressionChange(evt);
    }
  };

  const onDescriptionChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    if (!evt.target.value) {
      variable.setDescription(undefined);
    } else {
      variable.setDescription(evt.target.value);
    }
  };

  const handleFieldFocus = (evt: FocusEvent<HTMLInputElement|HTMLTextAreaElement>|MouseEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    // Stopping propagation allows the user to select text in the input field without 
    // inadvertently dragging the card/node.
    evt.stopPropagation();
    data.dqRoot.setSelectedNode(data.node);
  };

  const handleFieldBlur = () => {
    data.dqRoot.setSelectedNode(undefined);
  };

  const renderValueUnitInput = () => {
    return (
      <div className="variable-info-row value-unit-row">
        <NumberInput
          className={classNames("variable-info value", {"invalid": variable.computedValueError})}
          dataTestId="variable-value"
          isValid={isValidNumber}
          realValue={variable.value}
          setRealValue={variable.setValue}
          unsetSelectedNode={handleFieldBlur}
          otherProps={{
            placeholder: "value",
            autoComplete: "off",
            maxLength: kMaxNameCharacters,
            onMouseDown: handleFieldFocus,
            onFocus: handleFieldFocus,
          }}
        />
        <input
          className={classNames("variable-info unit", {"invalid": variable.computedUnitError})}
          type="text"
          placeholder="unit"
          autoComplete="off"
          value={shownUnit|| ""}
          data-testid="variable-unit"
          onChange={onUnitChange}
          onMouseDown={handleFieldFocus}
          onFocus={handleFieldFocus}
          onBlur={handleFieldBlur}
        />
      </div>
    );
  };

  const renderValueUnitUnEditable = () => {
    return (
      <div className="variable-info-row value-unit-row">
        <div className={classNames("variable-info value static", {"no-value": !shownValue, "invalid": variable.computedValueError})}>
          {shownValue !== undefined ? variable.computedValueWithSignificantDigits : "value"}
        </div>
        <div className={classNames("variable-info unit static", {"no-value": shownUnit, "invalid": variable.computedUnitError})}>
          {shownUnit || "unit"}
        </div>
      </div>
    );
  };

  const renderExpressionErrorMessage = () => {
    return (
      <>
        {variable.computedValueError && <p>Warning: {variable.computedValueError}</p>}
        {variable.computedUnitError && variable.computedUnitError !== variable.computedValueError &&
          <p>Warning: {variable.computedUnitError}</p>
        }
        {variable.computedUnitMessage && <p>Warning: {variable.computedUnitMessage}</p>}
      </>
    );
  };

  const nodeHeight = hasExpression ? "155px" : "120px";
  const nodeWidth = "220px";
  const targetNodeHandleStyle = {height: nodeHeight, width: nodeWidth, left: "1px", opacity: 0, borderRadius: 0};
  const sourceHandleStyle = {border: "none", borderRadius: "50%", width: "12px", height: "12px", background: "#949494", right: "-5px"};

  const nodeClasses = classNames(variable.color, "node", {
    "expression-shown": hasExpression,
    selected: data.dqRoot.selectedNode === data.node,
    expanded: showDescription || showExpression
  });

  return (
    <div className={nodeClasses} data-testid="quantity-node">
      <div className="variable-info-container">
        <div className="variable-info-row name-row">
          <input
            className="variable-info name"
            type="text"
            placeholder="variable_name"
            autoComplete="off"
            value={variable.name || ""}
            data-testid="variable-name"
            onChange={onNameChange}
            onMouseDown={handleFieldFocus}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          />
        </div>
        {hasExpression &&
          <div className={classNames("variable-info-row", "expression-row", {"expanded": showExpression })} data-testid="variable-expression-row">
            <TextareaAutosize
              autoComplete="off"
              className={classNames("variable-expression-area", { "invalid": variable.computedValueError || variable.computedUnitError })}
              data-testid={"variable-expression"}
              maxLength={kMaxNotesCharacters}
              maxRows={2}
              minRows={1}
              onChange={onExpressionChange}
              placeholder={"expression"}
              value={variable.expression || ""}
              onKeyDown={handleExpressionKeyDown}
              onMouseDown={handleFieldFocus}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
            {hasLongExpression &&
              <button className="variable-expression-toggle" onClick={handleShowExpression} data-testid="variable-expression-toggle-button">
                <IconExpand />
              </button>
            }
          </div>
        }
        {hasExpression ? renderValueUnitUnEditable() : renderValueUnitInput()}
        <div className={classNames("variable-info-row", "description-row", { expanded: showDescription })}>
          {showDescription && 
            <TextareaAutosize
              className="variable-description-area"
              value={variable.description || ""}
              onChange={onDescriptionChange}
              minRows={1}
              maxLength={kMaxNotesCharacters}
              maxRows={3}
              placeholder={"notes"}
              data-testid={"variable-description"}
              onMouseDown={handleFieldFocus}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
          }
          <button className="variable-description-toggle" onClick={handleShowDescription} data-testid="variable-description-toggle-button">
            <IconExpand />
          </button>
        </div>
        {hasError &&
          <>
            <div className="error-icon">
              <IconWarning />
            </div>
            <div className="error-message">
              {renderExpressionErrorMessage()}
            </div>
          </>
        }
      </div>
      {data.dqRoot.connectingVariable && data.dqRoot.connectingVariable !== variable &&
        <Handle
          type="target"
          position={Position.Left}
          style={{...targetNodeHandleStyle}}
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={isConnectable}
          id="a"
        />
      }
      <Handle
        className="flow-handle"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        title="drag to connect"
      />
      <div className="variable-info-floater">
        <button className="color-palette-toggle" onClick={handleEditColor} title="Edit Color" data-testid="color-edit-button">
          <IconColorMenu />
        </button>
        {showColorEditor && <ColorEditor variable={variable} onShowColorEditor={handleEditColor}/>}
      </div>
    </div>
  );
};

// In the custom node example memo is used here, but when I
// used it then the component was updating when it was marked
// as an observer and its model changed. So I'd guess memo
// might get in the way of observer.
// export const QuantityNode = memo(observer(_QuantityNode));

// Also with testing the observer isn't needed for simple changes
// like deleting edges or connecting edges.
// My guess is that Flow re-renders on all changes like this
// as long as the change triggers this re-render we are fine.
//
// But if the model gets changed without a flow re-render
// then, it doesn't update without the observer
export const QuantityNode = observer(_QuantityNode);
// Because it is observed we have to set the display name
QuantityNode.displayName = "QuantityNode";
