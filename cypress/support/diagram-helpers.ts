import { kMaxNotesCharacters } from "../../src/diagram/utils/validate";

// Returns the node with the given index
export const node = (index: number) => cy.get("[data-testid='node-container'").eq(index);

export const colorPaletteButton = (index: number) => node(index).find(".color-palette-toggle");
export const notesButton = (index: number) => node(index).find(".variable-description-toggle");

// Returns the given field for the node with the given index, usually to check its content with .should("contain.html")
export const nameField = (index: number) => node(index).find(".name-row input");
export const notesField = (index: number) => node(index).find(".description-row textarea");
const valueUnit = (index: number) => node(index).find(".value-unit-row textarea");
export const valueField = (index: number) => valueUnit(index).eq(0);
export const unitField = (index: number) => valueUnit(index).eq(1);

// Enters the given field into the node with the given index
export const enterName = (index: number, name: string) => nameField(index).type(name);
export const enterNotes = (index: number, notes: string) => notesField(index).type(notes);
export const enterValue = (index: number, value: string) => valueField(index).type(value);
export const enterUnit = (index: number, unit: string) => unitField(index).type(unit);

export const circlePicker = (index: number) => node(index).find("circle-picker");

// The default setup has node with index 2 as the output node. 0, 1, and 3 are inputs.
export const computedNodeIndex = 2;
export const computedNode = () => node(computedNodeIndex);
export const expressionField = (nodeIndex = computedNodeIndex) => node(nodeIndex).find(".expression-row textarea");
export const enterExpression = (text: string) => expressionField().type(text);
export const morePromptButton = () => computedNode().find(".more-prompt-button");
export const errorBottom = () => computedNode().find(".error-bottom");

export const longNotes = "a".repeat(kMaxNotesCharacters + 5);
export const legalNotes = "a".repeat(kMaxNotesCharacters);
