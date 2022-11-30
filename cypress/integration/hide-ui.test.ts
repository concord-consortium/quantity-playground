context("Test hiding default Diagram UI", () => {
  before(() => {
    cy.visit("?hideUI");
  });

  describe("Diagram renders without UI elements", () => {
    it("UI elements are not rendered", () => {
      // Minimap does not render
      cy.get(".react-flow__minimap").should("not.exist");

      // Toolbar buttons do not render
      cy.get(".add-variable-button").should("not.exist");
      cy.get(".edit-variable-button").should("not.exist");
      cy.get(".unused-variable-button").should("not.exist");
      cy.get(".delete-card-button").should("not.exist");

      // Zoom controls do not render
      cy.get(".react-flow__controls").should("not.exist");
    });
  });
});
