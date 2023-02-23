import {
  morePromptButton, enterExpression, computedNode, errorBottom, enterName, enterUnit, enterValue
} from "../support/diagram-helpers";
import {
  incompatibleUnitsEmoji, incompatibleUnitsExpanded, incompatibleUnitsShort,
  incompleteEmoji, incompleteExpanded, incompleteShort,
  unknownSymbolEmoji, unknownSymbolExpanded, unknownSymbolShort
} from "../../src/diagram/utils/error";

context("Test error messages", () => {
  describe("Custom error messages", () => {
    beforeEach(() => {
      cy.visit("");
    });

    it("renders full incomplete error", () => {
      morePromptButton().should("not.exist");
      enterExpression("a+");
      computedNode().find(".error-emoji").should("contain.html", incompleteEmoji);
      computedNode().find(".error-short").should("contain.html", incompleteShort);
      errorBottom().should("not.exist");
      morePromptButton().should("exist");
      morePromptButton().click();
      morePromptButton().should("not.exist");
      errorBottom().should("exist");
      errorBottom().should("contain.html", incompleteExpanded);
    });

    it (`renders incomplete for various incomplete expressions`, () => {
      const incompleteExpressions = ["+ a + b", "+a", "*a+b", "a+*b", "/a+b", "a+/b", "^a+b",
        "a+^b", "(a+b", "a(+b", "a+(b", "a+b)"];
      const testIncomplete = (expression: string) => {
        cy.visit("");
        enterExpression(expression);
        computedNode().find(".error-short").should("contain.html", "Um, still working?");
      };
      incompleteExpressions.forEach(expression => testIncomplete(expression));
    });

    it("renders full unknown symbol error", () => {
      const variableName = "variablename";
      enterExpression(variableName);
      computedNode().find(".error-emoji").should("contain.html", unknownSymbolEmoji);
      computedNode().find(".error-short").should("contain.html", unknownSymbolShort);
      computedNode().find(".error-short").should("contain.html", variableName);
      morePromptButton().click();
      errorBottom().should("contain.html", unknownSymbolExpanded);
    });

    it("renders unknown symbol for one unknown symbol", () => {
      enterName(0, "a");
      enterExpression("a + c");
      computedNode().find(".error-short").should("contain.html", unknownSymbolShort);
      computedNode().find(".error-short").should("contain.html", "c");
    });

    it("renders unknown symbol for combined variable names", () => {
      enterName(0, "a");
      enterName(1, "c");
      enterExpression("ac");
      computedNode().find(".error-short").should("contain.html", unknownSymbolShort);
      computedNode().find(".error-short").should("contain.html", "ac");
    });

    it("renders unknown symbol for disconnected variable names", () => {
      const dataTransfer = new DataTransfer();
      cy.get(".add-variable-button").trigger("dragstart", { dataTransfer });
      const connection = (index: number) => cy.get(".react-flow__connection").eq(index).find("path");
      connection(1).trigger("drop", { dataTransfer });
      enterName(0, "a");
      enterName(4, "c");
      enterExpression("a + c");
      computedNode().find(".error-short").should("contain.html", unknownSymbolShort);
      computedNode().find(".error-short").should("contain.html", "c");
    });

    it("renders full incompatible units error when different units are added", () => {
      enterName(0, "a");
      enterUnit(0, "m");
      enterName(1, "c");
      enterValue(1, "1");
      enterUnit(1, "s");
      enterExpression("a + c");
      computedNode().find(".error-emoji").should("contain.html", incompatibleUnitsEmoji);
      computedNode().find(".error-short").should("contain.html", incompatibleUnitsShort);
      morePromptButton().click();
      errorBottom().should("contain.html", incompatibleUnitsExpanded);
    });

    it("renders incompatible units error when adding a unitless variable", () => {
      enterName(0, "a");
      enterUnit(0, "m");
      enterName(1, "c");
      enterValue(1, "1");
      enterExpression("a + c");
      computedNode().find(".error-short").should("contain.html", incompatibleUnitsShort);
    });
  });
});
