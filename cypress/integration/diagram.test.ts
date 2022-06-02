context("Test Diagram interaction", () => {
  before(() => {
    cy.visit("");
  });

  describe("Interactions with the Diagram", () => {
    it("renders with 3 nodes", () => {
      cy.get("[data-testid='quantity-node'").should("have.length", 4);
    });

    it("can connect nodes", () => {
      cy.get("[data-testid='quantity-node'").eq(1)
        .find("[data-testid='variable-expression']")
        .should("not.exist");
      cy.get("[data-testid='quantity-node']").first()
        .find("[title='drag to connect']")
        .trigger("mousedown");
      cy.get("[data-testid='quantity-node']").eq(1)
        .trigger("mousemove")
        .trigger("mouseup")
        .find("[data-testid='variable-expression']")
        .should("exist");
    });

    it("cannot connect a node to itself", () => {
      cy.get("[data-testid='quantity-node'").first()
        .find("[data-testid='variable-expression']")
        .should("not.exist");

      cy.get("[data-testid='quantity-node']").first()
        .find("[title='drag to connect']")
        .trigger("mousedown");

      cy.get("[data-testid='quantity-node']").first()
        .trigger("mousemove")
        .trigger("mouseup")
        .find("[data-testid='variable-expression']")
        .should("not.exist");
    });
  });
});
