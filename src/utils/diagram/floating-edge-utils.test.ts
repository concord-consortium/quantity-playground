import { getEdgeParams } from "./floating-edge-util";

describe("Floating Edge Utils", () => {
  it("getEdgeParams returns edge positioning", async () => {
    const sourceNode = {__rf: {width: 220, height: 155, position: {x: 100, y:100}}};
    const targetNode = {__rf: {width: 220, height: 155, position: {x: 500, y:500}}};
    const edgeParams = getEdgeParams(sourceNode, targetNode);

    expect(edgeParams.sx).toBeCloseTo(287.5,0);
    expect(edgeParams.sy).toBeCloseTo(255,0);
    expect(edgeParams.tx).toBeCloseTo(532.5,0);
    expect(edgeParams.tx).toBeCloseTo(532.5,0);
    expect(edgeParams.sourcePos).toEqual("top");
    expect(edgeParams.targetPos).toEqual("top");
  });
});
