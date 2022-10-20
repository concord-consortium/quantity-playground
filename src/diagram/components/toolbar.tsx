
import React from "react";
import { DQRootType } from "../models/dq-root";

interface IProps {
  dqRoot: DQRootType;
  getDiagramExport?: () => unknown;
  showEditVariableDialog?: () => void;
}

export const ToolBar: React.FC<IProps> = ({ dqRoot, getDiagramExport, showEditVariableDialog }) => {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData("application/reactflow", "quantity");
        event.dataTransfer.effectAllowed = "move";
        event.stopPropagation();
    };

    const copyDiagramURL = () => {
        const exportedDiagram = getDiagramExport?.();
        console.log("Exported Diagram", exportedDiagram);
        const url = new URL(window.location.href);
        url.searchParams.set("diagram", JSON.stringify(exportedDiagram));
        console.log(url.href);
        navigator.clipboard.writeText(url.href);
    };

    return (
      <div style={{zIndex: 4, position: "absolute", right: 0, top: 0, display: "flex", flexDirection:"column"}} >
        { getDiagramExport && <button className="action" onClick={copyDiagramURL}>Copy Diagram URL</button> }
        <div style={{border: "1px", borderStyle: "solid", textAlign: "center"}} onDragStart={(event) => onDragStart(event)} draggable>
           Drag to Add
        </div>
        { showEditVariableDialog &&
          <button
            className="edit-variable-button"
            disabled={!dqRoot.selectedNode}
            onClick={showEditVariableDialog}
          >
            Edit Variable
          </button>
        }
      </div>
    );
};
