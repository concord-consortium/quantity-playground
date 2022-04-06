import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import React from "react";
import { Handle, Position } from "react-flow-renderer/nocss";
import { DQNodeType } from "../models/dq-node";
import { DQRootType } from "../models/dq-root";
import { Operation } from "../models/variable";

import DeleteIcon from "../../assets/delete.svg";
import "./quantity-node.scss";

interface IProps {
  data: {node: DQNodeType, dqRoot: DQRootType};
  isConnectable: boolean;
}

const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
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

  const onValueChange = (evt: any) => {
    // if the value is null or undefined just store undefined
    if (evt.target.value == null) {
      variable.setValue(undefined);
    } else {
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
  const shownValue = variable.numberOfInputs > 0 ? variable.computedValue : variable.value;
  const shownUnit = variable.numberOfInputs > 0 ? variable.computedUnit : variable.unit;
  return (
    <div className={"node"}>
      <div className="remove-node-button" onClick={handleRemoveNode} title={"Delete Node"}>
        <DeleteIcon />
      </div>
      <div className="inputs-outputs">
        <div className="inputs">
            <div className="input">
              <Handle
                type="target"
                position={Position.Left}
                style={{top: "27%", left: "-12px", border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", background: "#bcbcbc"}}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={isConnectable}
                id="a"
              />
              <Handle
                type="target"
                position={Position.Left}
                style={{ top: "73%", left: "-12px", border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", background: "#bcbcbc"}}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={isConnectable}
                id="b"

              />
            </div>
        </div>
        <div className={"variable-info-container"}>
          <input className={"variable-info name"} placeholder="name" onChange={onNameChange} value={variable.name || ""} onMouseDown={e => e.stopPropagation()}/>
          <input className={"variable-info value"} type="number" placeholder="value" onChange={onValueChange}
            value={shownValue !== undefined ? shownValue.toString() : ""} onMouseDown={e => e.stopPropagation()}/>
          <input className={"variable-info unit"} type="text" placeholder="unit" onChange={onUnitChange} value={shownUnit|| ""} onMouseDown={e => e.stopPropagation()}/>
          <select className={"variable-info operation"} value={data.node.variable.operation || ""} onChange={onOperationChange}>
            { // in an enumeration the keys are the names and the values are string ornumeric identifier
            }
            <option key="none" value="">none</option>
            {Object.entries(Operation).map(([name, symbol]) =>
              <option key={name} value={symbol}>{symbol}</option>
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
       <Handle
         type="source"
         position={Position.Right}
         isConnectable={isConnectable}
         style={{border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", right: "-12px", background: "#bcbcbc"}}
       />
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
