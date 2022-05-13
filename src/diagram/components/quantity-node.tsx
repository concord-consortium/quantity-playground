import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import React, { useState } from "react";
import { Handle, Position } from "react-flow-renderer/nocss";
import { DQNodeType } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";
import { ExpressionEditor } from "./expression-editor";

import "./quantity-node.scss";

const DeleteIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">
    <path d="M5.41,4,7.93,1.49a.27.27,0,0,0,0-.36L6.87.07a.27.27,0,0,0-.36,0L4,2.59,1.49.07a.27.27,
0,0,0-.36,0L.07,1.13a.27.27,0,0,0,0,.36L2.59,4,.07,6.51a.27.27,0,0,0,0,.36L1.13,7.93a.27.27,0,0,
0,.36,0L4,5.41,6.51,7.93a.27.27,0,0,0,.36,0L7.93,6.87a.27.27,0,0,0,0-.36Z"/>
  </svg>
;

const EditIcon = () =>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
    <path d="M12.06,4,10.94,5.16a.3.3,0,0,1-.41,0L7.84,2.47a.3.3,0,0,1,0-.41L9,.94a1.16,1.16,0,0,1,1.64,0L12.06,2.4A1.16,1.16,0,0,1,12.06,4ZM6.88,3,.52,9.38,0,12.32A.58.58,0,0,0,.68,13l2.95-.51L10,6.12a.31.31,0,0,0,0-.42L7.3,3a.29.29,0,0,0-.42,0ZM3,8.83a.33.33,0,0,1,0-.48L6.73,4.62a.34.34,0,0,1,.48,0,.33.33,0,0,1,0,.48L3.48,8.83a.33.33,0,0,1-.47,0Zm-.88,2H3.29v.88L1.73,12,1,11.27,1.25,9.7h.88Z" />
  </svg>
;

interface IProps {
  data: {node: DQNodeType, dqRoot: DQRootType};
  isConnectable: boolean;
}

const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
  const [showExpressionEditor, setShowExpressionEditor] = useState(false);

  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  if (!isAlive(data.node) || !data.node.tryVariable) {
      return null;
  }
  const variable = data.node.variable;

  const handleRemoveNode = () => {
    const nodeToRemove = data.dqRoot.getNodeFromVariableId(variable.id);
    data.dqRoot.removeNode(nodeToRemove);
  };

  const handleEditExpression = (show: boolean) => {
    setShowExpressionEditor(show);
  };

  const onValueChange = (evt: any) => {
    // if the value is null or undefined or empty just store undefined
    if (evt.target.value == null || evt.target.value === "") {
      variable.setValue(undefined);
    } else {
      // If the value is the empty string parseFloat turns that into NaN which
      // we want to avoid.
      variable.setValue(parseFloat(evt.target.value));
    }
  };

  const onUnitChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setUnit(undefined);
    } else {
      variable.setUnit(evt.target.value);
    }
  };

  const onNameChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setName(undefined);
    } else {
      variable.setName(evt.target.value);
    }
  };

  const renderValueUnitInput = () => {
    return (
      <div className="variable-info-row">
        <input className="variable-info value" type="number" placeholder="value" autoComplete="off" onChange={onValueChange} data-testid="variable-value"
          value={shownValue !== undefined ? shownValue.toString() : ""} onMouseDown={e => e.stopPropagation()} />
        <input className="variable-info unit" type="text" placeholder="unit" autoComplete="off" value={shownUnit|| ""} data-testid="variable-unit"
          onChange={onUnitChange} onMouseDown={e => e.stopPropagation()} />
      </div>
    );
  };
  const renderValueUnitUnEditable = () => {
    return (
      <div className="variable-info-row">
        <div className={`variable-info value static ${shownValue ? "" : "no-value"}`}>{shownValue !== undefined ? variable.computedValueWithSignificantDigits : "value"}</div>
        <div className={`variable-info unit static ${shownUnit ? "" : "no-value"}`}>{shownUnit || "unit"}</div>
      </div>
    );
  };

  const hasExpression = variable.numberOfInputs > 0;
  const shownValue = hasExpression ? variable.computedValue : variable.value;
  const shownUnit = hasExpression ? variable.computedUnit : variable.unit;
  const nodeHeight = hasExpression ? "155px" : "120px";
  const nodeWidth = "220px";
  const targetNodeHandleStyle = {height: nodeHeight, width: nodeWidth, left: "1px", opacity: 0, borderRadius: 0};
  const sourceHandleStyle = {border: "1px solid white", borderRadius: "6px", width: "12px", height: "12px", background: "#bcbcbc"};

  return (
    <div className={`node ${hasExpression ? "expression-shown" : ""}`} data-testid="quantity-node">
      <div className="remove-node-button" onClick={handleRemoveNode} title={"Delete Node"} data-testid={"delete-node-button"}>
        <DeleteIcon/>
      </div>
      <div className="variable-info-container">
        <div className="variable-info-row">
          <input className="variable-info name" type="text" placeholder="name" autoComplete="off" value={variable.name || ""} data-testid="variable-name"
            onMouseDown={e => e.stopPropagation()} onChange={onNameChange} />
        </div>
        {hasExpression &&
          <div className="variable-info-row">
            <div className="variable-info expression" placeholder="expression" data-testid="variable-expression" onClick={()=>handleEditExpression(true)} >
              {variable.expression || ""}
            </div>
            <div className="edit-expression-button" onClick={()=>handleEditExpression(true)} title={"Edit Expression"}  data-testid="variable-expression-edit-button">
              <EditIcon/>
            </div>
          </div>
        }
        {hasExpression ? renderValueUnitUnEditable() : renderValueUnitInput()}
        { variable.computedValueError &&
          <div className="error-message">
              ⚠️ {variable.computedValueError}
          </div>
        }
        { variable.computedUnitError &&
          <div className="error-message">
              ⚠️ {variable.computedUnitError}
          </div>
        }
        { variable.computedUnitMessage &&
          <div className="error-message">
              ⓘ {variable.computedUnitMessage}
          </div>
          }
      </div>
      {data.dqRoot.isInConnectingMode &&
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
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={sourceHandleStyle}
      />
      {showExpressionEditor && <ExpressionEditor variable={variable} onShowExpressionEditor={handleEditExpression}/>}
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
