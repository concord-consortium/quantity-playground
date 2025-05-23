import { destroy, types, flow } from "mobx-state-tree";
import { DQRoot, UnitsManager } from "../diagram";
import { Variable, VariableType } from "../diagram/models/variable";

export const AppStore = types.model("AppStore", {
  version: types.literal("1"),
  diagram: DQRoot,
  variables: types.map(Variable),
})
.volatile(self => ({
  unitsManager: new UnitsManager()
}))
.actions(self => {
  const removeVariable = flow(function* removeVariable(variable?: VariableType) {
    if (variable) {
      // Inside of CLUE the middleware and update function will take care of
      // deleting the DQNode. But outside of CLUE we need to do it ourselves.
      //
      // In order to emulate what happens in CLUE and more quickly find issues,
      // this is done asynchronously.
      const node = self.diagram.getNodeFromVariableId(variable.id);

      destroy(variable);

      // In order to emulate more of what happens when running inside of CLUE
      // this small delay is added.
      yield new Promise((resolve) => {
        setTimeout(resolve, 1);
      });

      if (node) {
        destroy(node);
      }
    }
  });

  const createVariable = () => {
    const variable = Variable.create();
    self.variables.put(variable);
    return variable;
  };

  return {
    removeVariable,
    createVariable
  };
})
.views(self => ({
  getVariables() {
    return Array.from(self.variables.values());
  }
}))
.actions(self => ({
  afterCreate() {
    self.diagram.setVariablesAPI(self);
  }
}));
