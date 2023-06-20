import { AppStore } from "../../components/app-store";
import defaultDiagram from "../../components/default-diagram";
import { DQRoot } from "./dq-root";

describe("DQRoot", () => {
  it("can be created", () => {
    const root = DQRoot.create();
    expect(root.nodes).toBeDefined();
  });

  it("can generate react flow nodes", () => {
    const appStore = AppStore.create(defaultDiagram);
    const root = appStore.diagram;
    const nodes = root.reactFlowNodes;
    const readOnlyNodes = root.reactFlowNodesReadOnly;

    expect({ nodes, readOnlyNodes }).toMatchSnapshot();
  });

  it("can generate react flow edges", () => {
    const appStore = AppStore.create(defaultDiagram);
    const root = appStore.diagram;
    const edges = root.reactFlowEdges;

    expect(edges).toMatchSnapshot();
  });
});
