import { kMaxNotesCharacters, processName } from "../../src/diagram/utils/validate";

context("Test Edit Variable Dialog", () => {
  before(() => {
    cy.visit("");
  });

  const editVariableButton = () => cy.get(".edit-variable-button");
  const editVariableDialog = () => cy.get(".qp-dialog");
  const editVariableOkButton = () => cy.get(".dialog-button").last();
  const nodes = () => cy.get("[data-testid='quantity-node']");
  const nodeToEdit = () => nodes().first();
  const nameField = () => cy.get("#evd-name");
  const valueField = () => cy.get("#evd-value");
  const notesField = () => cy.get("#evd-notes");
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
      nameField().should("exist");
      nameField().type(variableName);
      editVariableOkButton().click();
      editVariableDialog().should("not.exist");
      nodeToEdit().find(".name").should("have.value", variableName);
    });
    it("Validation works", () => {
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
      const longNotes = "a".repeat(kMaxNotesCharacters + 5);
      const legalNotes = "a".repeat(kMaxNotesCharacters);
      notesField().clear();
      notesField().type(longNotes);

      // After the value field has been blurred, it should switch to undefined
      valueField().should("have.value", "");

      // Save changes and make sure the correct values have been saved
      editVariableOkButton().click();
      nodeToEdit().find(".name").should("have.value", nameNoSpaces);
      nodeToEdit().find(".value").should("have.value", "");
      nodeToEdit().find(".variable-description-area").should("have.value", legalNotes);
    });
  });
});
