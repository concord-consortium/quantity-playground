import { SnapshotIn } from "mobx-state-tree";
import { Operation } from "../diagram/models/variable";
import { AppStore } from "./app-store";

const defaultDiagram: SnapshotIn<typeof AppStore> = {
  version: "1",
  diagram: {
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
        },
        "4": {
          id: "4",
          variable: "d",
          x: 250,
          y: 250
      }
    }
  },
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
      inputs:["a", "d", "b"],
      operation: Operation.Add,
    },
    "d": {
      id: "d",
    },
  }
};

export default defaultDiagram;
