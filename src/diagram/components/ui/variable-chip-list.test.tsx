import React from "react";
import { render } from "@testing-library/react";

import { VariableChipList } from "./variable-chip-list";
import { Variable } from "../../models/variable";

describe("VariableChipList", () => {
  const v1 = Variable.create({name: "v1", value: 1.1});
  const v2 = Variable.create({name: "v2"});
  const v3 = Variable.create({name: "v3", value: -202.02, unit: "mile"});
  const v4 = Variable.create({value: 1.1});
  const v5 = Variable.create({name: "v5", unit: "second"});
  const variables = [v1, v2, v3, v4];
  const selectedVariables = [v2, v4, v5];

  it("renders a list", () => {
    const {container} = render(<VariableChipList variables={variables}/>);
    expect(container.getElementsByClassName("variable-chip").length).toBe(4);
  });
  it("renders selected variables in a list", () => {
    const {container} = render(<VariableChipList variables={variables} selectedVariables={selectedVariables} />);
    expect(container.getElementsByClassName("selected").length).toBe(2);
  });
});
