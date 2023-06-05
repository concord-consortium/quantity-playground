
import React from "react";
import { observer } from "mobx-react-lite";
import { DQRootType } from "../models/dq-root";

interface IProps {
  deleteCard?: () => void;
  dqRoot: DQRootType;
  getDiagramExport?: () => unknown;
  hideNewVariableButton?: boolean;
  readOnly?: boolean;
  showEditVariableDialog?: () => void;
  showUnusedVariableDialog?: () => void;
}

export const ToolBar: React.FC<IProps> = observer(function ToolBar({ deleteCard, dqRoot, getDiagramExport, hideNewVariableButton,
  readOnly, showEditVariableDialog, showUnusedVariableDialog })
{
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
      { !(hideNewVariableButton || readOnly) &&
        <div className="add-variable-button" style={{border: "1px", borderStyle: "solid", textAlign: "center"}} onDragStart={(event) => onDragStart(event)} draggable>
            Drag to Add
        </div>
      }
      { showEditVariableDialog &&
        <button
          className="edit-variable-button"
          disabled={readOnly || !dqRoot.selectedNode}
          onClick={showEditVariableDialog}
        >
          Edit Variable
        </button>
      }
      { showUnusedVariableDialog &&
        <button
          className="unused-variable-button"
          disabled={readOnly || dqRoot.unusedVariables.length <= 0}
          onClick={showUnusedVariableDialog}
        >
          Unused Variables
        </button>
      }
      { deleteCard &&
        <button
          className="delete-card-button"
          disabled={readOnly || !dqRoot.selectedNode}
          onClick={deleteCard}
        >
          Delete Card
        </button>
      }
    </div>
  );
});
