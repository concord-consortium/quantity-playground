import { DQNode } from "./dq-node";
import { GenericContainer } from "./test-utils";
import { Variable } from "./variable";

describe("DQNode", () => {
  it("can be instantiated with undefined value", () => {
    const variable = Variable.create({});
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });

    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.add(node);

    expect(node.variable.value).toBeUndefined();
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // it("can't be instantiated with null value but can import null values", () => {
  //   // @ts-expect-error null value on create results in TypeScript error
  //   const node = DQNode.create({ value: null, x: 0, y: 0 });
  //   // but null is converted to undefined automatically via import
  //   expect(node.value).toBeUndefined();
  // });

  it("can be updated after being created", () => {
    const variable = Variable.create({});
    const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
    const inputAVariable = Variable.create({});
    const inputANode = DQNode.create({ variable: inputAVariable.id, x: 0, y: 0 });
    const inputBVariable = Variable.create({});
    const inputBNode = DQNode.create({ variable: inputBVariable.id, x: 0, y: 0 });

    // references have to be within the same tree so we need some container
    const container = GenericContainer.create();
    container.add(variable);
    container.add(node);
    container.add(inputAVariable);
    container.add(inputANode);
    container.add(inputBVariable);
    container.add(inputBNode);

    expect(node.variable).toBeDefined();
    expect(node.variable.inputs).toEqual([]);

    node.setInput(inputANode);
    node.setInput(inputBNode);
    expect(node.variable.inputs[0]).toBe(inputAVariable);
    expect(node.variable.inputs[1]).toBe(inputBVariable);

    node.updatePosition(100,50);
    expect(node.x).toBe(100);
    expect(node.y).toBe(50);
  });
});
