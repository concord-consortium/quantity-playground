// Returns the node with the given index
export const node = (index: number) => cy.get("[data-testid='node-container'").eq(index);

// Returns the given field for the node with the given index, usually to check its content with .should("contain.html")
const valueUnit = (index: number) => node(index).find(".value-unit-row textarea");
export const valueField = (index: number) => valueUnit(index).eq(0);
export const unitField = (index: number) => valueUnit(index).eq(1);

// Enters the given field into the node with the given index
export const enterName = (index: number, name: string) => node(index).find(".name-row input").type(name);
export const enterValue = (index: number, value: string) => valueField(index).type(value);
export const enterUnit = (index: number, unit: string) => unitField(index).type(unit);

// The default setup has node with index 2 as the output node. 0, 1, and 3 are inputs.
export const computedNodeIndex = 2;
export const computedNode = () => node(computedNodeIndex);
export const enterExpression = (text: string) => computedNode().find(".expression-row textarea").type(text);
export const morePromptButton = () => computedNode().find(".more-prompt-button");
export const errorBottom = () => computedNode().find(".error-bottom");
