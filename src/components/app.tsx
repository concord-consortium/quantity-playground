import { applySnapshot, getSnapshot, onSnapshot } from "mobx-state-tree";
import React from "react";
import { Diagram } from "../diagram/components/diagram";
import { AppStore } from "./app-store";
import { Operation } from "../diagram/models/variables";
import codapInterface from "../lib/CodapInterface";

import "./app.scss";

const url = new URL(window.location.href);
const showNestedSet = !(url.searchParams.get("nestedSet") == null);

const loadInitialState = () => {
  const urlDiagram = url.searchParams.get("diagram");

  // Default diagram
  let diagram = {
    diagram: {
      variables: "variables-root",
      nodes: {
          "1": {
              id: "1",
              variable: "a",
              x: 100,
              y: 100
          },
          "2": {
              id: "2",
              variable: "b",
              x: 100,
              y: 200
          },
          "3": {
              id: "3",
              variable: "c",
              x: 250,
              y: 150
          }
      }
    },
    variables: {
      id: "variables-root",
      variables: {
        "a": {
          id: "a",
          value: 124,
        },
        "b": {
            id: "b",
        },
        "c": {
            id: "c",
            inputA: "a",
            inputB: "b",
            operation: Operation.Divide,
        }
      }
    }
  };

  // Override default diagram with URL param or prior state
  if (urlDiagram) {
    diagram = JSON.parse(urlDiagram);
  }

  return diagram;
};

const appStore = AppStore.create(loadInitialState());

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
        applySnapshot(appStore, initialState);
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

export const App = () => {
  return (
    <div className="app">
      <Diagram dqRoot={appStore.diagram} {...{showNestedSet, getDiagramExport}} />
    </div>
  );
};
