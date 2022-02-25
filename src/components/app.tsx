import { applySnapshot, getSnapshot, onSnapshot } from "mobx-state-tree";
import React from "react";
import { Diagram } from "../diagram/components/diagram";
import { Operation } from "../diagram/models/dq-node";
import { DQRoot } from "../diagram/models/dq-root";
import codapInterface from "../lib/CodapInterface";

import "./app.scss";

const url = new URL(window.location.href);
const showNestedSet = !(url.searchParams.get("nestedSet") == null);

const loadInitialState = () => {
  const urlDiagram = url.searchParams.get("diagram");

  // Default diagram
  let diagram = {
    nodes: {
        "1": {
            id: "1",
            value: 124,
            x: 100,
            y: 100
        },
        "2": {
            id: "2",
            x: 100,
            y: 200
        },
        "3": {
            id: "3",
            inputA: "1",
            inputB: "2",
            operation: Operation.Divide,
            x: 250,
            y: 150
        }
    }
  };

  // Override default diagram with URL param or prior state
  if (urlDiagram) {
    diagram = JSON.parse(urlDiagram);
  }

  return diagram;
};

const dqRoot = DQRoot.create(loadInitialState());

// For debugging
(window as any).dqRoot = dqRoot;
(window as any).getSnapshot = getSnapshot;

// TODO: rewrite this as a reusable custom hook (useCodapConnection)
const initializeCodapConnection = () => {
  const codapConfig = {
    customInteractiveStateHandler: true,
    name: "Quantitative Playground",
    version: "1.0"
  };

  codapInterface.on("get", "interactiveState", "",
      () => {return {success: true, values: getSnapshot(dqRoot)};});

  codapInterface.init(codapConfig).then(
    (initialState) => {
      if (initialState?.nodes) {
        applySnapshot(dqRoot, initialState);
        // when the model changes, notify CODAP that the plugin is 'dirty'
        onSnapshot(dqRoot,() => {
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

export const App = () => {
  return (
    <div className="app">
      <Diagram dqRoot={dqRoot} showNestedSet={showNestedSet} />
    </div>
  );
};
