import { kMaxNotesCharacters } from "../../src/diagram/utils/validate";

export const nodeClass = "[data-testid='node-container']";
export const edgeClass = ".react-flow__edge";

// Returns the node with the given index
export const pane = () => cy.get(".react-flow__pane");
export const nodes = () => cy.get(nodeClass);
export const node = (index: number) => nodes().eq(index);
export const selectedNodes = () => cy.get(`${nodeClass} .selected`);
export const connection = (index: number) => cy.get(".react-flow__edge-path").eq(index);
export const connectionTarget = (index: number) => cy.get(".react-flow__edge-target").eq(index);
export const edges = () => cy.get(edgeClass);
export const edge = (index: number) => edges().eq(index);
export const selectedEdges = () => cy.get(`${edgeClass}.selected`);
export const deleteEdgeButton = (index: number) => cy.get(".delete-button").eq(index);
export const deleteCardButton = () => cy.get(".delete-card-button");

export const colorPaletteButton = (index: number) => node(index).find(".color-palette-toggle");
export const notesButton = (index: number) => node(index).find(".variable-description-toggle");

// Returns the given field for the node with the given index, usually to check its content with .should("contain.html")
export const nameField = (index: number) => node(index).find(".name-row input");
export const notesField = (index: number) => node(index).find(".description-row textarea");
const valueUnit = (index: number) => node(index).find(".value-unit-row textarea");
export const valueField = (index: number) => valueUnit(index).eq(0);
export const unitField = (index: number) => valueUnit(index).eq(1);

// Enters the given field into the node with the given index
export const enterName = (index: number, name: string) => nameField(index).clear().type(name);
export const enterNotes = (index: number, notes: string) => notesField(index).clear().type(notes);
export const enterValue = (index: number, value: string) => valueField(index).clear().type(value);
export const enterUnit = (index: number, unit: string) => unitField(index).clear().type(unit);

export const circlePicker = (index: number) => node(index).find(".circle-picker");

// The default setup has node with index 2 as the output node. 0, 1, and 3 are inputs.
export const computedNodeIndex = 2;
export const computedNode = () => node(computedNodeIndex);
export const expressionField = (nodeIndex = computedNodeIndex) => node(nodeIndex).find(".expression-row textarea");
export const enterExpression = (text: string) => expressionField().clear().type(text);
export const morePromptButton = () => computedNode().find(".more-prompt-button");
export const errorBottom = () => computedNode().find(".error-bottom");

export const longNotes = "a".repeat(kMaxNotesCharacters + 5);
export const legalNotes = "a".repeat(kMaxNotesCharacters);
