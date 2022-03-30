
import React from "react";

interface IProps {
    getDiagramExport?: () => unknown;
}

export const ToolBar: React.FC<IProps> = ({getDiagramExport}) => {
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
      </div>
    );
};
