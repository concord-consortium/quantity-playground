import { types } from "mobx-state-tree";
import { DQNode } from "./dq-node";
import { Variable } from "./variable";
import { DQRoot } from "./dq-root";

// references have to be within the same tree so we need some container
export const GenericContainer = types.model("GenericContainer", {
  items: types.array(types.union(DQRoot, DQNode, Variable))
})
.actions(self => ({
  add(item: any) {
    self.items.push(item);
  }
}));
