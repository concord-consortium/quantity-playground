import { applySnapshot } from "mobx-state-tree";
import { AppStore } from "./app-store";
import defaultDiagram from "./default-diagram";

describe("AppStore", () => {
  it("can't load old versions", () => {
    const appStore = AppStore.create(defaultDiagram);
    expect(() => {
      applySnapshot(appStore, {diagram: {}, variables: {}} as any);
    }).toThrow();
    expect(appStore.version).toBe("1");
  });
});
