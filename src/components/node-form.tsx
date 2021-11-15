import { observer } from "mobx-react-lite";
import { Instance } from "mobx-state-tree";
import React from "react";
import { DQNode } from "../models/dq-models";

interface IProps {
    node: Instance<typeof DQNode>;
  }
  
const _NodeForm: React.FC<IProps> = ({ node }) => {
  const onChange = (evt: any) => {
    // This won't handle 0 correctly
    if (!evt.target.value) {
      node.setValue(undefined);
    } else {
      node.setValue(parseInt(evt.target.value, 10));
    }
  };

  return (
    <div style={{zIndex: 4, position: "absolute"}}>
      <label>value:</label>
      <input value={node.value || ""} onChange={onChange}/>
    </div>
  );
};

export const NodeForm = observer(_NodeForm);
NodeForm.displayName = "NodeForm";
