context("Test Unused Variable Dialog and Delete Button", () => {
  const deleteCardButton = () => cy.get(".delete-card-button");
  const unusedVariableButton = () => cy.get(".unused-variable-button");
  const nodes = () => cy.get("[data-testid='quantity-node']");
  const nodeToEdit = () => nodes().first();

  const unusedVariableDialog = () => cy.get(".qp-dialog");
  const unusedVariableCancelButton = () => cy.get(".dialog-button").last();
  const unusedVariableOkButton = () => cy.get(".dialog-button").last();
  const unusedChips = () => cy.get(".qp-dialog .variable-chip");
  const selectedUnusedChips = () => cy.get(".qp-dialog .variable-chip.selected");
  
  it("Delete Card Button", () => {
    cy.visit("");

    cy.log("Can delete a card and buttons are disabled properly");
    deleteCardButton().should("be.disabled");
    unusedVariableButton().should("be.disabled");
    nodes().should("have.length", 4);
    nodeToEdit().click();
    deleteCardButton().should("be.enabled");
    deleteCardButton().click();
    nodes().should("have.length", 3);
    deleteCardButton().should("be.disabled");
    unusedVariableButton().should("be.enabled");

    cy.log("Unused variable dialog renders");
    unusedVariableButton().click();
    unusedVariableDialog().should("exist");
    unusedVariableOkButton().should("exist");
    unusedVariableCancelButton().should("exist").click();
    
    cy.log("Multi select list works");
    nodeToEdit().click();
    deleteCardButton().click();
    unusedVariableButton().click();
    unusedChips().should("have.length", 2);
    selectedUnusedChips().should("have.length", 0);
    unusedChips().first().click();
    selectedUnusedChips().should("have.length", 1);
    unusedChips().last().click();
    selectedUnusedChips().should("have.length", 2);
    unusedChips().first().click();
    selectedUnusedChips().should("have.length", 1);
    
    cy.log("Can permanently remove variables");
    unusedVariableOkButton().click();
    unusedVariableButton().click();
    unusedChips().should("have.length", 1);
    unusedChips().click();
    unusedVariableOkButton().click();
    unusedVariableButton().should("be.disabled");
  });
});
