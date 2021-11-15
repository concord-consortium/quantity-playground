import { observer } from "mobx-react-lite";
import { Instance } from "mobx-state-tree";
import React from "react";
import { DQNode } from "../models/dq-models";

interface IProps {
    node: Instance<typeof DQNode>;
  }
  
const _NodeForm: React.FC<IProps> = ({ node }) => {
  const onValueChange = (evt: any) => {
    // This won't handle 0 correctly
    if (!evt.target.value) {
      node.setValue(undefined);
    } else {
      node.setValue(parseInt(evt.target.value, 10));
    }
  };

  const onUnitChange = (evt: any) => {
    if (!evt.target.value) {
      node.setUnit(undefined);
    } else {
      node.setUnit(evt.target.value);
    }
  };

  const onNameChange = (evt: any) => {
    if (!evt.target.value) {
      node.setName(undefined);
    } else {
      node.setName(evt.target.value);
    }
  };

  return (
    <div style={{zIndex: 4, position: "absolute"}}>
      <div>
        <label>name:</label>
        <input value={node.name || ""} onChange={onNameChange}/>
      </div>
      <div>
        <label>value:</label>
        <input value={node.value || ""} onChange={onValueChange}/>
      </div>
      <div>
        <label>unit:</label>
        <input value={node.unit || ""} onChange={onUnitChange}/>
      </div>
    </div>
  );
};

export const NodeForm = observer(_NodeForm);
NodeForm.displayName = "NodeForm";
