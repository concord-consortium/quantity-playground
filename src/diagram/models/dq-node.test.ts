import { types } from "mobx-state-tree";
import { AppStore } from "../../components/app-store";
import { DQNode } from "./dq-node";
import { Variable } from "./variable";

describe("DQNode", () => {
  it("can be instantiated with undefined value", () => {
    const variable = Variable.create({});
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });

    // references have to be within the same tree so we need some container 
    const ContainerModel = types.model("ContainerModel", {
      items: types.array(types.union(DQNode, Variable))
    })
    .actions(self => ({
      add(item: any) {
        self.items.push(item);
      }
    }));
    const container = ContainerModel.create();
    container.add(variable);
    container.add(node);

    expect(node.variable.value).toBeUndefined();
  });

  // it("can't be instantiated with null value but can import null values", () => {
  //   // @ts-expect-error null value on create results in TypeScript error
  //   const node = DQNode.create({ value: null, x: 0, y: 0 });
  //   // but null is converted to undefined automatically via import
  //   expect(node.value).toBeUndefined();
  // });
});
