import { applySnapshot, getSnapshot, onSnapshot } from "mobx-state-tree";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Diagram } from "../diagram/components/diagram";
import { EditVariableDialog, updateVariable } from "../diagram/components/dialog/edit-variable-dialog";
import { AppStore } from "./app-store";
import codapInterface from "../lib/CodapInterface";
import defaultDiagram from "./default-diagram";

import "./app.scss";

const url = new URL(window.location.href);
const showNestedSet = !(url.searchParams.get("nestedSet") == null);

const loadInitialState = () => {
  const urlDiagram = url.searchParams.get("diagram");
  if (urlDiagram) {
    const diagram = JSON.parse(urlDiagram);
    try {
      return AppStore.create(diagram);
    } catch (error) {
      // If there is an error in the diagram from the URL
      // fall back to the default diagram
      console.error("Diagram in the URL is an old version or invalid", error);
    }
  } 

  return AppStore.create(defaultDiagram);
};

const appStore = loadInitialState();

// For debugging
(window as any).appStore = appStore;
(window as any).getSnapshot = getSnapshot;

// TODO: rewrite this as a reusable custom hook (useCodapConnection)
const initializeCodapConnection = () => {
  const codapConfig = {
    customInteractiveStateHandler: true,
    name: "Quantitative Playground",
    version: "1.0"
  };

  codapInterface.on("get", "interactiveState", "",
      () => {return {success: true, values: getSnapshot(appStore)};});

  codapInterface.init(codapConfig).then(
    (initialState) => {
      if (initialState?.diagram) {
        try {
          applySnapshot(appStore, initialState);
        } catch (error) {
          // If there is an error in the diagram from CODAP don't completely
          // blow up just fall back to the default diagram
          console.error("Diagram in CODAP is an old version or invalid", error);
        }
        // when the model changes, notify CODAP that the plugin is 'dirty'
        onSnapshot(appStore, () => {
          codapInterface.sendRequest({
            "action": "notify",
            "resource": "interactiveFrame",
            "values": {"dirty": true}
          });
        });
      }
      else {
        codapInterface.sendRequest({
          action: "update",
          resource: "interactiveFrame",
          values: {dimensions: {height: 600, width: 800}}
        });
      }
    },
    (msg: string) => {
      console.warn("No CODAP: " + msg);
    }
  );
};

initializeCodapConnection();

const getDiagramExport = () => {
  return getSnapshot(appStore);
};

export const App = observer(() => {
  const [showEditVariableDialog, setShowEditVariableDialog] = useState(false);

  return (
    <div className="app">
      <Diagram
        dqRoot={appStore.diagram}
        {...{showNestedSet, getDiagramExport}}
        showEditVariableDialog={() => setShowEditVariableDialog(true)}
      />
      {showEditVariableDialog && appStore.diagram.selectedNode &&
        <EditVariableDialog
          onClose={() => setShowEditVariableDialog(false)}
          onSave={updateVariable}
          variable={appStore.diagram.selectedNode.variable}
        />}
    </div>
  );
});
