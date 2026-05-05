import React from "react";
import { applySnapshot, IAnyStateTreeNode, SnapshotIn } from "mobx-state-tree";
import { act, render } from "@testing-library/react";

import { kEmptyVariable, VariableChip } from "./variable-chip";
import { Variable } from "../../models/variable";

// Under React 18, observer components driven by external stores re-render via
// setState inside reactions, so synchronous applySnapshot calls during a test
// must be wrapped in act() for the assertion to see the new render.
const applySnapshotAct = (target: IAnyStateTreeNode, snapshot: SnapshotIn<typeof Variable>) => {
  act(() => { applySnapshot(target, snapshot); });
};

describe("VariableChip", () => {
  it("renders all combinations", () => {
    const variable = Variable.create();
    const {container} = render(<VariableChip variable={variable}/>);
    expect(container).toHaveTextContent(kEmptyVariable);

    applySnapshotAct(variable, {id: variable.id, name: "some name"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshotAct(variable, {id: variable.id, value: 1.234});
    expect(container).toHaveTextContent(/^1.23$/);

    applySnapshotAct(variable, {id: variable.id, unit: "m"});
    expect(container).toHaveTextContent(/^\(m\)$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", value: 1.234});
    expect(container).toHaveTextContent(/^some name=1.23$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", unit: "m"});
    expect(container).toHaveTextContent(/^some name\(m\)$/);

    applySnapshotAct(variable, {id: variable.id, value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^1.23m$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^some name=1.23m$/);
  });
  it("properly renders name only variable chips", () => {
    const variable = Variable.create();
    const { container } = render(<VariableChip variable={variable} nameOnly={true} />);
    expect(container).toHaveTextContent(kEmptyVariable);

    applySnapshotAct(variable, {id: variable.id, name: "some name"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshotAct(variable, {id: variable.id, value: 1.234});
    expect(container).toHaveTextContent(/^1.23$/);

    applySnapshotAct(variable, {id: variable.id, unit: "m"});
    expect(container).toHaveTextContent(/^\(m\)$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", value: 1.234});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", unit: "m"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshotAct(variable, {id: variable.id, value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^1.23m$/);

    applySnapshotAct(variable, {id: variable.id, name: "some name", value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^some name$/);
  });
});
