context("Test Diagram interaction", () => {
  before(() => {
    cy.visit("");
  });

  const editVariableButton = () => cy.get(".edit-variable-button");
  const editVariableDialog = () => cy.get(".qp-dialog");
  const nodes = () => cy.get("[data-testid='quantity-node']");
  const nodeToEdit = () => nodes().first();
  describe("Edit Variable Dialog", () => {
    it("Edit variable button present and active when a node is selected", () => {
      editVariableButton().should("exist");
      editVariableButton().should("be.disabled");
      nodeToEdit().click();
      editVariableButton().should("not.be.disabled");
    });
    it("Dialog appears and works", () => {
      const variableName = "variable-name";
      editVariableButton().click();
      editVariableDialog().should("exist");
      cy.get("#evd-name").should("exist");
      cy.get("#evd-name").type(variableName);
      cy.get(".dialog-button").last().click();
      editVariableDialog().should("not.exist");
      nodeToEdit().find(".name").should("have.value", variableName);
    });
  });
});
