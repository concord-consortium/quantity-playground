context("Test error messages", () => {
  const computedNode = () => cy.get("[data-testid='node-container'").eq(2);
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
      computedNode().find(".error-emoji").should("contain.html", "🫤");
      computedNode().find(".error-short").should("contain.html", "Um, still working?");
      errorBottom().should("not.exist");
      morePromptButton().should("exist");
      morePromptButton().click();
      morePromptButton().should("not.exist");
      errorBottom().should("exist");
      errorBottom().should("contain.html", "Check for anything missing or extra in the expression");
    });

    it("renders incomplete for '+ a + b'", () => {
      enterExpression("+ a + b");
      computedNode().find(".error-short").should("contain.html", "Um, still working?");
    });
  });
});
