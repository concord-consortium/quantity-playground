import { destroy, types } from "mobx-state-tree";
import { DQRoot } from "../diagram";
import { Variable, Variables, VariableType } from "../diagram/models/variables";

export const AppStore = types.model("AppStore", {
  diagram: DQRoot,
  variables: Variables
})
.actions(self => ({
  afterCreate() {
    self.diagram.setVariablesAPI({
      removeVariable(variable?: VariableType) {
        if (variable) {
          // Inside of CLUE the middleware and update function will take care of
          // deleting the DQNode. But outside of clue we need to do it
          // ourselves.
          //
          // Previously it was done with: self.nodes.delete(nodeId); But I think
          // just calling destroy on the node should do the same thing.
          const node = self.diagram.getNodeFromVariableId(variable.id);
          destroy(node);

          destroy(variable);
        }
      },
      createVariable() {
        const variable = Variable.create();
        self.variables.addVariable(variable);
        return variable;
      }
    });
  }
}));
