import { AppStore } from "../../components/app-store";
import defaultDiagram from "../../components/default-diagram";
import { DQRoot } from "./dq-root";

describe("DQRoot", () => {
  it("can be created", () => {
    const root = DQRoot.create();
    expect(root.nodes).toBeDefined();
  });

  it("can generate react flow elements", () => {
    const appStore = AppStore.create(defaultDiagram);
    const root = appStore.diagram;
    const elements = root.reactFlowElements;

    expect(elements).toMatchSnapshot();
  });
});
