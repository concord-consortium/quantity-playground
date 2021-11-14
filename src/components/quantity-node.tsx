import React, { memo } from "react";

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

// I'm not sure this is needed
export const QuantityNode = memo(_QuantityNode);

// Because it is memoized we have to set the display name
QuantityNode.displayName = "QuantityNode";
