import { Variable } from "../models/variable";
import { canAddInput } from "./graph-utils";
import { GenericContainer } from "./test-utils";

describe("Discovers illegal inputs", () => {
  const a = Variable.create({ id: "a", name: "a" });
  const b = Variable.create({ id: "b", name: "b" });
  const c = Variable.create({ id: "c", name: "c" });
  const d = Variable.create({ id: "d", name: "d" });
  const container = GenericContainer.create();
  container.add(a);
  container.add(b);
  container.add(c);
  container.add(d);

  it("cannot connect to oneself", () => {
    expect(canAddInput(a, a)).toEqual(false);
  });

  it("can connect when no relationship", () => {
    expect(canAddInput(a, b)).toEqual(true);
    b.addInput(a);
  });

  it("cannot create a duplicate connection", () => {
    expect(canAddInput(b, a)).toEqual(false);
  });

  it("cannot connect to ancestors but can connect to descendents", () => {
    expect(canAddInput(d, c)).toEqual(true);
    expect(canAddInput(d, b)).toEqual(true);
    expect(canAddInput(d, a)).toEqual(true);
    d.addInput(c);
    c.addInput(b);
    expect(canAddInput(d, c)).toEqual(false);
    expect(canAddInput(d, b)).toEqual(false);
    expect(canAddInput(d, a)).toEqual(false);
    expect(canAddInput(c, b)).toEqual(false);
    expect(canAddInput(c, a)).toEqual(false);
    expect(canAddInput(b, d)).toEqual(true);
    expect(canAddInput(a, c)).toEqual(true);
    expect(canAddInput(a, d)).toEqual(true);
  });
});
