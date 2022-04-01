import { observer } from "mobx-react-lite";
import { isAlive } from "mobx-state-tree";
import React from "react";
import DeleteIcon from "../../assets/delete.svg";

import { Handle, Position } from "react-flow-renderer/nocss";
import { DQNodeType } from "../models/dq-node";
import "./quantity-node.scss";

interface IProps {
  data: {node: DQNodeType};
  isConnectable: boolean;
}

const _QuantityNode: React.FC<IProps> = ({ data, isConnectable }) => {
  // When the node is removed from MST, this component gets
  // re-rendered for some reason, so we check here to make sure we
  // aren't working with a destroyed model
  if (!isAlive(data.node)) {
      return null;
  }

  // const targetStyle = { border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", top: "27%", background: "#bcbcbc"};
  return (
    <div className={"node"}>
      <div className="close-node-button">
        {/* onClick={handleClick(compProps.onClick)} title={"Delete Node"}> */}
        <DeleteIcon />
      </div>
      <div className="inputs-outputs">
        <div className="inputs">
            <div className="input">
              <Handle
                type="target"
                position={Position.Left}
                style={{top: "27%", border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", background: "#bcbcbc"}}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={isConnectable}
                id="a"
              />
              <Handle
                type="target"
                position={Position.Left}
                style={{ top: "73%", border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", background: "#bcbcbc"}}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={isConnectable}
                id="b"

              />
            </div>
        </div>
        <div className={"variable-info-container"}>
          {/* <div  className={"variable-info"}> */}
            {data.node.name ? <strong>{data.node.name}</strong> : <input className={"variable-info-input name"} type="text" placeholder="name" />}
          {/* </div> */}
          {/* <div  className={"variable-info"}> */}
            {data.node.computedValueWithSignificantDigits && data.node.computedValueWithSignificantDigits !=="NaN"
              ? <strong>{data.node.computedValueWithSignificantDigits}</strong>
              : <input className={"variable-info-input"} type="text" placeholder="value" />}
          {/* </div> */}
          {/* <div  className={"variable-info"}> */}
             {data.node.computedUnit ? <strong>{data.node.computedUnit}</strong> : <input className={"variable-info-input"} type="text" placeholder="unit" />}
          {/* </div> */}
          {/* { data.node.computedValueError &&
            <div>
              ⚠️ {data.node.computedValueError}
            </div>
          }
          { data.node.computedUnitError &&
            <div>
              ⚠️ {data.node.computedUnitError}
            </div>
          }
          { data.node.computedUnitMessage &&
            <div>
                ⓘ {data.node.computedUnitMessage}
            </div>
          } */}
          <select className={"operation-selection"}>
            <option value="">none</option>
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="x">x</option>
            <option value="÷">÷</option>
          </select>
        </div>
       <Handle
         type="source"
         position={Position.Right}
         isConnectable={isConnectable}
         style={{border: "1px solid white", borderRadius: " 12px", width: "24px", height: "24px", background: "#bcbcbc"}}
       />

      </div>
    </div>
  );

  // return (
  //   <>
  //     <Handle
  //       type="target"
  //       position={Position.Left}
  //       style={{ top: "27%", background: "#555" }}
  //       onConnect={(params) => console.log("handle onConnect", params)}
  //       isConnectable={isConnectable}
  //       id="a"
  //     />
  //     <Handle
  //       type="target"
  //       position={Position.Left}
  //       style={{ top: "73%", background: "#555" }}
  //       onConnect={(params) => console.log("handle onConnect", params)}
  //       isConnectable={isConnectable}
  //       id="b"
  //     />
  //     <div style={{padding: "10px"}}>
  //       <div>
  //         Name: <strong>{data.node.name}</strong>
  //       </div>
  //       <div>
  //         Value: <strong>{data.node.computedValueWithSignificantDigits}</strong>
  //       </div>
  //       <div>
  //         Unit: <strong>{data.node.computedUnit}</strong>
  //       </div>
  //       { data.node.computedValueError &&
  //         <div>
  //             ⚠️ {data.node.computedValueError}
  //         </div>
  //       }
  //       { data.node.computedUnitError &&
  //         <div>
  //             ⚠️ {data.node.computedUnitError}
  //         </div>
  //       }
  //       { data.node.computedUnitMessage &&
  //         <div>
  //             ⓘ {data.node.computedUnitMessage}
  //         </div>
  //       }
  //       <div style={{position: "absolute", left: "-20px", top: "50%", transform: "translateY(-50%)", fontSize: "x-large"}}>
  //         {data.node.operation}
  //       </div>
  //     </div>
  //     <Handle
  //       type="source"
  //       position={Position.Right}
  //       style={{ background: "#555" }}
  //       isConnectable={isConnectable}
  //     />
  //   </>
  // );
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


// import * as React from "react";
// import { Node, Socket, Control } from "rete-react-render-plugin";
// import { DataflowNodePlot } from "./dataflow-node-plot";
// import { NodeType, NodeTypes } from "../../utilities/node";
// import "./dataflow-node.sass";

// export class DataflowNode extends Node {

//   public render() {
//     const { node, bindSocket, bindControl } = this.props;
//     const { outputs, controls, inputs } = this.state;

//     const settingsControls = controls.filter(isSettingControl);
//     const outputControls = controls.filter(isOutputControl);
//     const deleteControls = controls.filter(isDeleteControl);
//     const deleteControl = deleteControls && deleteControls.length ? deleteControls[0] : null;

//     const undecoratedInputs = inputs.filter(isDecoratedInput(false));
//     const decoratedInputs = inputs.filter(isDecoratedInput(true));
//     const plotButton = controls.find((c: any) => c.key === "plot");
//     const showPlot = plotButton ? plotButton.props.showgraph : false;
//     const nodeType = NodeTypes.find( (n: NodeType) => n.name === node.name);
//     const displayName = nodeType ? nodeType.displayName : node.name;

//     return (
//       <div className={`node ${node.name.toLowerCase().replace(/ /g, "-")}`}>
//         <div className="top-bar">
//           <div className="node-title">
//             {displayName}
//           </div>
//           {deleteControl &&
//             <Control
//               className="control"
//               key={deleteControl.key}
//               control={deleteControl}
//               innerRef={bindControl}
//               title={"Delete Node"}
//             />
//           }
//         </div>
//         {settingsControls.map((control: any) => (
//           <Control
//             className="control"
//             key={control.key}
//             control={control}
//             innerRef={bindControl}
//           />
//         ))}
//         {settingsControls.length > 0 &&
//           <div className="hr control-color" />
//         }
//         <div className="inputs-outputs">
//           <div className="inputs">
//             {this.props.node.name !== "Data Storage" && undecoratedInputs.map((input: any) => (
//               <div className="input" key={input.key}>
//                 <Socket
//                   type="input"
//                   socket={input.socket}
//                   io={input}
//                   innerRef={bindSocket}
//                 />
//               </div>
//             ))}
//           </div>
//           <div className="output-controls">
//             <div className={`output-container ${node.name.toLowerCase().replace(/ /g, "-")}`}>
//               {outputControls.map((control: any) => (
//                 <Control
//                   className="control"
//                   key={control.key}
//                   control={control}
//                   innerRef={bindControl}
//                 />
//               ))}
//             </div>
//           </div>
//           <div className="outputs">
//             {outputs.map((output: any) => (
//               <div className="node-output output" key={output.key}>
//                 <Socket
//                   type="output"
//                   socket={output.socket}
//                   io={output}
//                   innerRef={bindSocket}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="decorated-inputs">
//           {decoratedInputs.map((input: any) => (
//             <div className="input" key={input.key}>
//               <Socket
//                 type="input"
//                 socket={input.socket}
//                 io={input}
//                 innerRef={bindSocket}
//               />
//               <Control
//                 className="input-control"
//                 control={input.control}
//                 key={input.control.key}
//                 innerRef={bindControl}
//               />
//             </div>
//           ))}
//           {this.props.node.name === "Data Storage" && undecoratedInputs.map((input: any) => (
//             <div className="input" key={input.key}>
//               <Socket
//                 type="input"
//                 socket={input.socket}
//                 io={input}
//                 innerRef={bindSocket}
//               />
//             </div>
//           ))}
//         </div>
//         <DataflowNodePlot
//           display={showPlot}
//           data={node}
//         />
//       </div>
//     );
//   }
// }

// // all controls that are not the readouts of data (outputs) or delete
// function isSettingControl(control: any) {
//   return control.key !== "plot" && control.key !== "nodeValue" && control.key !== "delete";
// }

// function isOutputControl(control: any) {
//   return control.key === "plot" || control.key === "nodeValue";
// }

// function isDeleteControl(control: any) {
//   return control.key === "delete";
// }

// function isDecoratedInput(isDecorated: boolean) {
//   return (input: any) => !!input.control === isDecorated;
// }
