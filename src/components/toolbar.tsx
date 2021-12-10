
import React from "react";

interface IProps {
    exportDiagramState: any;
}

export const ToolBar: React.FC<IProps> = ({exportDiagramState}) => {
    const onDragStart = (event: any) => {
        event.dataTransfer.setData("application/reactflow", "quantity");
        event.dataTransfer.effectAllowed = "move";
    };
    
    const copyDiagramURL = () => {
        const exportedDiagram = exportDiagramState();
        const url = new URL(window.location.href);
        url.searchParams.set("diagram", JSON.stringify(exportedDiagram));
        console.log(url.href);
        navigator.clipboard.writeText(url.href);
    };
        
    return (
      <div style={{zIndex: 4, position: "absolute", right: 0, top: 0, display: "flex", flexDirection:"column"}} >
        <button className="action" onClick={copyDiagramURL}>Copy Diagram URL</button>
        <div style={{border: "1px", borderStyle: "solid", textAlign: "center"}} onDragStart={(event) => onDragStart(event)} draggable>
           Drag to Add
        </div>
      </div>
    );
};
