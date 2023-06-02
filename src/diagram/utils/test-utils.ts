import { types } from "mobx-state-tree";
import { DQNode } from "../models/dq-node";
import { Variable } from "../models/variable";
import { DQRoot, DQRootType } from "../models/dq-root";

// references have to be within the same tree so we need some container
export const GenericContainer = types.model("GenericContainer", {
  items: types.array(types.union(DQNode, Variable)),
  root: types.maybe(DQRoot)
})
.actions(self => ({
  add(item: any) {
    self.items.push(item);
  },
  setRoot(root: DQRootType) {
    self.root = root;
  }
}));
