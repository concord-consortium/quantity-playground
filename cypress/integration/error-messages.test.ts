import {
  incompleteEmoji, incompleteShort, incompleteExpanded,
  unknownSymbolEmoji, unknownSymbolShort, unknownSymbolExpanded
} from "../../src/diagram/utils/error";

context("Test error messages", () => {
  const node = (index: number) => cy.get("[data-testid='node-container'").eq(index);
  const enterName = (index: number, name: string) => node(index).find(".name-row input").type(name);
  const computedNode = () => node(2);
  const enterExpression = (text: string) => computedNode().find(".expression-row textarea").type(text);
  const morePromptButton = () => computedNode().find(".more-prompt-button");
  const errorBottom = () => computedNode().find(".error-bottom");
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

    it("renders incomplete for '+ a + b'", () => {
      enterExpression("+ a + b");
      computedNode().find(".error-short").should("contain.html", "Um, still working?");
    });

    it("renders incomplete for '+a'", () => {
      enterExpression("+a");
      computedNode().find(".error-short").should("contain.html", "Um, still working?");
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
      // connection(1).click();
      // cy.type("{backspace}");
      // connection(1).click();
      // cy.type("{backspace}");
      enterName(0, "a");
      enterName(4, "c");
      enterExpression("a + c");
      computedNode().find(".error-short").should("contain.html", unknownSymbolShort);
      computedNode().find(".error-short").should("contain.html", "c");
    });
  });
});
