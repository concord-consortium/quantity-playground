import React from "react";
import { Diagram } from "./diagram";
import { Operation } from "../models/dq-node";
import { DQRoot } from "../models/dq-root";

import "./app.scss";

const url = new URL(window.location.href);
// const showNestedSet = !(url.searchParams.get("nestedSet") == null);

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

export const App = () => {
  return (
    <div className="app">
      <Diagram dqRoot={dqRoot} />
    </div>
  );
};
