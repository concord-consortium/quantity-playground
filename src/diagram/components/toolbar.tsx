
import React from "react";
import {guaranteeDataSet, createItem, createCaseTable} from "../../utils/codap-helper";

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

    const exportToCODAP = () => {
        const exportedDiagram = getDiagramExport?.() as {variables:any};
        if (exportedDiagram) {
            console.log(`Diagram: ${JSON.stringify(exportedDiagram)}`);
            const variables: any = Object.values(exportedDiagram.variables);
            guaranteeDataSet("dq-data", "", variables)
                .then(() => createItem("dq-data", variables))
                .then( () => createCaseTable("dq-data"));
        }
    };

    const inCODAP = () => {
        // todo better discrimination here
        return window.parent !== window;
    };

    return (
      <div style={{zIndex: 4, position: "absolute", right: 0, top: 0, display: "flex", flexDirection:"column"}} >
        { getDiagramExport && <button className="action" onClick={copyDiagramURL}>Copy Diagram URL</button> }
        { getDiagramExport && inCODAP() && <button className="action" onClick={exportToCODAP}>Export Data To CODAP</button> }
        <div style={{border: "1px", borderStyle: "solid", textAlign: "center"}} onDragStart={(event) => onDragStart(event)} draggable>
           Drag to Add
        </div>
      </div>
    );
};
