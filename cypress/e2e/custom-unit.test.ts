import {
  computedNodeIndex, computedNode, enterExpression, unitField, enterName, enterValue, enterUnit
} from "../support/diagram-helpers";
import {
  incompatibleUnitsEmoji, incompatibleUnitsShort
} from "../../src/diagram/utils/error";

context("Test custom units", () => {
  it("Custom units", () => {
    cy.visit("");

    cy.log("adds custom units");
    enterName(0, "a");
    enterUnit(0, "foo");
    enterExpression("a");
    unitField(computedNodeIndex).should("contain.html", "foo");
    
    enterExpression("a*2");
    unitField(computedNodeIndex).should("contain.html", "foo");

    enterName(1, "b");
    enterValue(1, "2");
    enterUnit(1, "foo");
    enterExpression("a+b");
    unitField(computedNodeIndex).should("contain.html", "foo");

    enterName(1, "b");
    enterValue(1, "2");
    enterUnit(1, "foo");
    enterExpression("a*b");
    unitField(computedNodeIndex).should("contain.html", "foo^2");

    enterName(1, "b");
    enterValue(1, "2");
    enterUnit(1, "moo");
    enterExpression("a*b");
    unitField(computedNodeIndex).should("contain.html", "foo moo");
    
    enterName(1, "b");
    enterValue(1, "2");
    enterUnit(1, "moo");
    enterExpression("a/b");
    unitField(computedNodeIndex).should("contain.html", "foo / moo");
    
    enterName(1, "b");
    enterValue(1, "2");
    enterUnit(1, "moo");
    enterExpression("a+b");
    unitField(computedNodeIndex).should("contain.html", "");
    computedNode().find(".error-emoji").should("contain.html", incompatibleUnitsEmoji);
    computedNode().find(".error-short").should("contain.html", incompatibleUnitsShort);
  });
});
