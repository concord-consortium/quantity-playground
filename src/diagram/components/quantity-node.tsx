import React, { ChangeEvent, FocusEvent, MouseEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import { Handle, Position } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";

import { ColorEditor } from "./color-editor";
import { DQNodeType, kDefaultNodeHeight, kDefaultNodeRowHeight, kDefaultNodeWidth, kExpandedNotesHeight } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";
import { kMaxNameCharacters, kMaxNotesCharacters, processName } from "../utils/validate";
import { ExpandableInput } from "./ui/expandable-input";
import { IconColorMenu } from "./icons/icon-color-menu";
import { IconExpand } from "./icons/icon-expand";
import { ErrorMessageComponent } from "./error-message";
import { canAddInput } from "../utils/graph-utils";

interface IProps {
  data: {node: DQNodeType, dqRoot: DQRootType, readOnly?: boolean };
  isConnectable: boolean;
}

const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
  const { dqRoot, node, readOnly } = data;
  const canConnect = isConnectable && !readOnly;
  const variable = node.variable;
  const kDefaultExpandLength = 10;
  const kExpressionExpandLength = 18;

  const [showColorEditor, setShowColorEditor] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  const nodeAlive = isAlive(node) && node.tryVariable;

  // State used to track updates to the unit before they're ready to be committed to the model.
  const variableUnit = nodeAlive ? variable.unit : undefined;
  const [displayUnit, setDisplayUnit] = useState(variableUnit);
  useEffect(() => {
    setDisplayUnit(variableUnit);
  }, [variableUnit]);

  if (!nodeAlive) {
      return null;
  }

  const hasExpression = !!(variable.numberOfInputs > 0);
  const errorMessage = variable.errorMessage;
  const shownValue = hasExpression ? variable.computedValue?.toString() || "" : variable.currentValue;
  const shownUnit = hasExpression ? variable.computedUnit : displayUnit;

  const handleEditColor = () => {
    setShowColorEditor(!showColorEditor);
  };

  const handleShowDescription = () => {
    setShowDescription(!showDescription);
  };

  const handleFieldFocus = (evt: FocusEvent<HTMLInputElement|HTMLTextAreaElement>|MouseEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    dqRoot.setSelectedNode(node);
  };

  const onUnitBlur = (evt: FocusEvent<HTMLTextAreaElement>) => {
    variable.setUnit(evt.target.value);
  };

  const onUnitChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    setDisplayUnit(evt.target.value);
  };

  const onNameChange = (evt: ChangeEvent<HTMLInputElement>) => {
    variable.setName(evt.target.value ? processName(evt.target.value) : undefined);
  };

  const onDescriptionChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    variable.setDescription(evt.target.value);
  };

  const onExpressionChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    variable.setExpression(evt.target.value);
  };

  const handleExpressionKeyDown = (evt: any) => {
    if (evt.key === "Enter" || evt.key === "Escape") {
      evt.preventDefault();
      evt.stopPropagation();
      onExpressionChange(evt);
    }
  };

  const handleClick = (event: MouseEvent) => {
    dqRoot.setSelectedNode(node);
  };

  const renderValueUnitInput = (params: {disabled: boolean}) => {
    const { disabled } = params;
    const staticValue = shownValue !== undefined
                          ? variable.computedValueWithSignificantDigits
                          : undefined;

    return (
      <div className="variable-info-row value-unit-row">
        <ExpandableInput
          disabled={disabled}
          error={!!(variable.computedValueError)}
          inputType="number"
          lengthToExpand={kDefaultExpandLength}
          maxLength={kMaxNameCharacters}
          placeholder="value"
          title="value"
          value={!disabled ? variable.currentValue : staticValue}
          handleFocus={handleFieldFocus}
          setRealValue={variable.setValue}
        />
        <ExpandableInput
          disabled={disabled}
          error={!!(variable.computedUnitError)}
          inputType="text"
          lengthToExpand={kDefaultExpandLength}
          maxLength={kMaxNameCharacters}
          placeholder="unit"
          title="unit"
          value={shownUnit || ""}
          handleBlur={onUnitBlur}
          handleChange={onUnitChange}
          handleFocus={handleFieldFocus}
        />
      </div>
    );
  };

  // Determine size and styling of target handle
  const yPadding = 15;
  const nodeHeight =
    kDefaultNodeHeight
    + (showDescription ? kExpandedNotesHeight : 0)
    + (hasExpression ? kDefaultNodeRowHeight : 0)
    + 2 * yPadding;
  const targetHeight = `${nodeHeight}px`;
  const xPadding = 15;
  const targetWidth = `${kDefaultNodeWidth + 2 * xPadding}px`;
  const targetNodeHandleStyle = {height: targetHeight, width: targetWidth, left: `-${xPadding}px`};
  const connectingVariable = dqRoot.connectingVariable;
  const allowConnection = connectingVariable && canAddInput(connectingVariable, variable);
  const targetClassName = classNames("node-target-handle", allowConnection && "can-connect");

  const nodeContainerClasses = classNames(variable.color, "node-container");
  const cannotConnect = connectingVariable && !allowConnection;
  const nodeClasses = classNames("node", cannotConnect && "cannot-connect", {
    selected: dqRoot.selectedNode === node,
  });

  return (
    <div className={nodeContainerClasses} data-testid="node-container" tabIndex={-1}>
      {!!errorMessage &&
        <ErrorMessageComponent
          errorMessage={errorMessage}
        />
      }
      <div className={nodeClasses} data-testid="quantity-node" onClick={handleClick} >
        <div className="variable-info-container">
          <div className="variable-info-row name-row">
            <input
              className="variable-info name nodrag"
              type="text"
              placeholder="variable_name"
              autoComplete="off"
              spellCheck="false"
              value={variable.name || ""}
              data-testid="variable-name"
              maxLength={kMaxNameCharacters}
              onChange={onNameChange}
              onMouseDown={handleFieldFocus}
              onFocus={handleFieldFocus}
            />
          </div>
          {hasExpression &&
            <div className="variable-info-row expression-row" data-testid="variable-expression-row">
              <ExpandableInput
                error={!!(variable.computedValueError || variable.computedUnitError)}
                inputType="text"
                lengthToExpand={kExpressionExpandLength}
                placeholder="expression"
                title="expression"
                value={variable.expression || ""}
                handleChange={onExpressionChange}
                handleFocus={handleFieldFocus}
                handleKeyDown={handleExpressionKeyDown}
              />
            </div>
          }
          {renderValueUnitInput({disabled: hasExpression})}
          <div className={classNames("variable-info-row", "description-row", { expanded: showDescription })}>
            {showDescription && 
              <TextareaAutosize
                autoComplete="off"
                className="variable-description-area nodrag"
                value={variable.description || ""}
                onChange={onDescriptionChange}
                minRows={1}
                maxLength={kMaxNotesCharacters}
                maxRows={3}
                placeholder={"notes"}
                data-testid={"variable-description"}
                onMouseDown={handleFieldFocus}
                onFocus={handleFieldFocus}
              />
            }
            <button className="variable-description-toggle" onClick={handleShowDescription} data-testid="variable-description-toggle-button">
              <IconExpand />
            </button>
          </div>
        </div>
        <Handle
          className={targetClassName}
          type="target"
          position={Position.Left}
          style={targetNodeHandleStyle}
          isConnectable={canConnect}
        />
        <Handle
          className="flow-handle"
          type="source"
          position={Position.Right}
          isConnectable={canConnect}
          title="drag to connect"
        />
        <div className="variable-info-floater">
          <button className="color-palette-toggle" onClick={handleEditColor} title="Edit Color" data-testid="color-edit-button">
            <IconColorMenu />
          </button>
          {showColorEditor && <ColorEditor variable={variable} onShowColorEditor={handleEditColor}/>}
        </div>
      </div>
    </div>
  );
};

export const QuantityNode = observer(_QuantityNode);
// Because it is observed we have to set the display name
QuantityNode.displayName = "QuantityNode";
