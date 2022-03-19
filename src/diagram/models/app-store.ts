import { types } from "mobx-state-tree";
import { DQRoot } from "..";
import { Variables } from "./variables";

export const AppStore = types.model("AppStore", {
  diagram: DQRoot,
  variables: Variables
});
