import {
  circlePicker, colorPaletteButton, enterExpression, enterName, enterNotes, enterUnit,
  enterValue, expressionField, legalNotes, longNotes, nameField, node, notesButton, notesField, unitField, valueField
} from "../support/diagram-helpers";
import { processName } from "../../src/diagram/utils/validate";

context("Test Diagram interaction", () => {
  beforeEach(() => {
    cy.visit("");
  });

  const nodeIndex = 1;
  const nodeToEdit = () => node(nodeIndex);

  describe("Variable Cards", () => {
    it("can enter basic input", () => {
      // Enter name, value, and unit
      const variableName = "my variable name";
      enterName(nodeIndex, variableName);
      nameField(nodeIndex).should("contain.value", processName(variableName));
      const variableValue = "45";
      enterValue(nodeIndex, variableValue);
      valueField(nodeIndex).should("contain.value", variableValue);
      const variableUnit = "miles";
      enterUnit(nodeIndex, variableUnit);
      unitField(nodeIndex).should("contain.value", variableUnit);

      // Illegal values display as invalid
      enterValue(nodeIndex, "letter");
      valueField(nodeIndex).should("have.class", "invalid");

      // Enter description
      const variableDescription = "a\ndescription";
      notesField(nodeIndex).should("not.exist");
      notesButton(nodeIndex).click();
      enterNotes(nodeIndex, variableDescription);
      notesField(nodeIndex).should("contain.value", variableDescription);

      // Notes are limited to kMaxNotesCharacters
      notesField(nodeIndex).clear();
      enterNotes(nodeIndex, longNotes);
      notesField(nodeIndex).should("contain.value", legalNotes);
    });
  });

  describe("Variable Cards", () => {
    it("can change color", () => {
      const cp = () => circlePicker(nodeIndex);
      const clickButton = () => colorPaletteButton(nodeIndex).click();
      nodeToEdit().should("have.class", "light-gray");
      cp().should("not.exist");
      clickButton();
      cp().should("exist");
      cp().find("span div span div").eq(5).click();
      nodeToEdit().should("have.class", "red");
      cp().should("not.exist");

      // Pressing the button closes the picker when it's open
      clickButton();
      cp().should("exist");
      clickButton();
      cp().should("not.exist");
    });
  });

  describe("Variable Cards", () => {
    it("can enter expressions", () => {
      expressionField(nodeIndex).should("not.exist");
      const variableExpression = "9+9";
      enterExpression(variableExpression);
      expressionField().should("have.value", variableExpression);
    });
  });
});
