import { processName } from "../../src/diagram/utils/validate";
import { longNotes, legalNotes } from "../support/diagram-helpers";

context("Test Edit Variable Dialog", () => {

  const editVariableButton = () => cy.get(".edit-variable-button");
  const editVariableDialog = () => cy.get(".qp-dialog");
  const editVariableOkButton = () => cy.get(".dialog-button").last();
  const descriptionToggleButton = () => cy.get("[data-testid='variable-description-toggle-button']").first();
  const nodes = () => cy.get("[data-testid='quantity-node']");
  const nodeToEdit = () => nodes().first();
  const nameField = () => cy.get("#evd-name");
  const valueField = () => cy.get("#evd-value");
  const notesField = () => cy.get("#evd-notes");
  const unitsField = () => cy.get("#evd-units");
  it("Edit Variable Dialog", () => {
    cy.visit("");
    
    cy.log("Edit variable button present and active when a node is selected");
    editVariableButton().should("exist");
    editVariableButton().should("be.disabled");
    nodeToEdit().click();
    editVariableButton().should("not.be.disabled");
      
    cy.log("Dialog appears and works");
    const variableName = "variable_name";
    editVariableButton().click();
    editVariableDialog().should("exist");
    nameField().should("exist");
    nameField().type(variableName);
    editVariableOkButton().click();
    editVariableDialog().should("not.exist");
    nodeToEdit().find(".name").should("have.value", variableName);
    
    cy.log("Validation works");
    // Open the edit variable dialog
    editVariableButton().click();

    // Enter a name with spaces (spaces should be removed)
    const nameSpaces = "name with spaces";
    const nameNoSpaces = processName(nameSpaces);
    nameField().clear();
    nameField().type(nameSpaces);

    // Enter a value with characters (should save as undefined)
    const illegalValue = ".1a2b";
    valueField().clear();
    valueField().type(illegalValue);
    valueField().should("have.class", "invalid");

    // Enter notes that are too long (should truncate)
    notesField().clear();
    notesField().type(longNotes);

    // After the value field has been blurred, it should switch to undefined
    valueField().should("have.value", "");

    // Value and Unit fields should not allow line breaks
    valueField().type("123{enter}456");
    valueField().should("have.value", "123456");
    unitsField().type("mp{enter}h");
    unitsField().should("have.value", "mph");

    // Save changes and make sure the correct values have been saved
    editVariableOkButton().click();
    nodeToEdit().find(".name").should("have.value", nameNoSpaces);
    nodeToEdit().find(".value").should("have.value", "123456");
    descriptionToggleButton().click();
    nodeToEdit().find(".variable-description-area").should("have.value", legalNotes);
  });
});
