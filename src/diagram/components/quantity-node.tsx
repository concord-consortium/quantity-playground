import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import React, { useState } from "react";
import { Handle, Position } from "react-flow-renderer/nocss";
import { DQNodeType } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";
import { Operation } from "../models/variable";
import { ExpressionEditor } from "./expression-editor";

import DeleteIcon from "../../assets/delete.svg";
import EditIcon from "../../assets/edit.svg";
import "./quantity-node.scss";

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
  const onOperationChange = (evt: any) => {
    if (!evt.target.value) {
      variable.setOperation(undefined);
    } else {
      variable.setOperation(evt.target.value);
    }
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
        <DeleteIcon />
      </div>
      <div className="variable-info-container">
        <div className="variable-info-row">
          <input className="variable-info name" type="text" placeholder="name" autoComplete="off" value={variable.name || ""} data-testid="variable-name"
            onMouseDown={e => e.stopPropagation()} onChange={onNameChange} />
        </div>
        {hasExpression &&
          <div className="variable-info-row">
            <div className="variable-info expression" placeholder="expression" data-testid="variable-expression">{variable.expression || ""}</div>
            <div className="edit-expression-button" onClick={()=>handleEditExpression(true)} title={"Edit Expression"}  data-testid="variable-expression-edit-button">
              <EditIcon />
            </div>
          </div>
        }
        <div className="variable-info-row">
          <input className="variable-info value" type="number" placeholder="value" autoComplete="off" onChange={onValueChange} data-testid="variable-value"
            value={shownValue !== undefined ? shownValue.toString() : ""} onMouseDown={e => e.stopPropagation()} />
          <input className="variable-info unit" type="text" placeholder="unit" autoComplete="off" value={shownUnit|| ""} data-testid="variable-unit"
            onChange={onUnitChange} onMouseDown={e => e.stopPropagation()} />
        </div>
        <div>
          <select className="variable-info operation" value={data.node.variable.operation || ""} onChange={onOperationChange}>
          { // in an enumeration the keys are the names and the values are string or numeric identifier
          }
          <option key="none" value="">none</option>
          {Object.entries(Operation).map(([name, symbol]) =>
            <option key={name} value={symbol} data-testid={`variable-operation-${name}`}>{symbol}</option>
          )}
          </select>
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
