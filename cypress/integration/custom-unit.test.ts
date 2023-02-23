import {
  computedNodeIndex, enterExpression, unitField, enterName, enterUnit
} from "../support/diagram-helpers";

context("Test custom units", () => {
  describe("Custom units", () => {
    beforeEach(() => {
      cy.visit("");
    });

    it("adds custom units", () => {
      enterName(0, "a");
      enterUnit(0, "foo");
      enterExpression("a");
      unitField(computedNodeIndex).should("contain.html", "foo");
    });
  });
});
