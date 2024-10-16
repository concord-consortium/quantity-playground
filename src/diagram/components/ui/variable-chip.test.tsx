import React from "react";
import { applySnapshot } from "mobx-state-tree";
import { render } from "@testing-library/react";

import { kEmptyVariable, VariableChip } from "./variable-chip";
import { Variable } from "../../models/variable";

describe("VariableChip", () => {
  it("renders all combinations", () => {
    const variable = Variable.create();
    const {container} = render(<VariableChip variable={variable}/>);
    expect(container).toHaveTextContent(kEmptyVariable);

    applySnapshot(variable, {id: variable.id, name: "some name"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshot(variable, {id: variable.id, value: 1.234});
    expect(container).toHaveTextContent(/^1.23$/);

    applySnapshot(variable, {id: variable.id, unit: "m"});
    expect(container).toHaveTextContent(/^\(m\)$/);

    applySnapshot(variable, {id: variable.id, name: "some name", value: 1.234});
    expect(container).toHaveTextContent(/^some name=1.23$/);

    applySnapshot(variable, {id: variable.id, name: "some name", unit: "m"});
    expect(container).toHaveTextContent(/^some name\(m\)$/);

    applySnapshot(variable, {id: variable.id, value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^1.23m$/);

    applySnapshot(variable, {id: variable.id, name: "some name", value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^some name=1.23m$/);
  });
  it("properly renders name only variable chips", () => {
    const variable = Variable.create();
    const { container } = render(<VariableChip variable={variable} nameOnly={true} />);
    expect(container).toHaveTextContent(kEmptyVariable);

    applySnapshot(variable, {id: variable.id, name: "some name"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshot(variable, {id: variable.id, value: 1.234});
    expect(container).toHaveTextContent(/^1.23$/);

    applySnapshot(variable, {id: variable.id, unit: "m"});
    expect(container).toHaveTextContent(/^\(m\)$/);

    applySnapshot(variable, {id: variable.id, name: "some name", value: 1.234});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshot(variable, {id: variable.id, name: "some name", unit: "m"});
    expect(container).toHaveTextContent(/^some name$/);

    applySnapshot(variable, {id: variable.id, value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^1.23m$/);

    applySnapshot(variable, {id: variable.id, name: "some name", value: 1.234, unit: "m" });
    expect(container).toHaveTextContent(/^some name$/);
  });
});
