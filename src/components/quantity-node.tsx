import { observer } from "mobx-react-lite";
import React from "react";

import { Handle, Position } from "react-flow-renderer";

interface IProps {
  data: any;
  isConnectable: boolean;
}
  
const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div style={{padding: "10px"}}>
        <div>
          Name: <strong>{data.node.name}</strong>
        </div>
        <div>
          Value: <strong>{data.node.computedValue}</strong>
        </div>
        <div>
          Unit: <strong>{data.node.computedUnit}</strong>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
        isConnectable={isConnectable}
      />
    </>
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
