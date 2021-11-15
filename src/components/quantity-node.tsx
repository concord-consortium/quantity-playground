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
      <div>
        Value: <strong>{data.node.computedValue}</strong>
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

// Also with testing the observer hasn't been needed yet
// My guess is that Flow re-renders on all changes so
// as long as the change triggers this re-render we are fine
// if the model gets changed without a flow re-render we'll
// have to see what happens
// export const QuantityNode = observer(_QuantityNode);
export const QuantityNode = _QuantityNode;

// Because it might be memoized or observed we have to set the display name
QuantityNode.displayName = "QuantityNode";
