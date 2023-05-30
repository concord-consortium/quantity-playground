import { connection, node, nodes, pane, selectedNodes, selectedEdges } from "../support/diagram-helpers";

context("Test Diagram interaction", () => {
  before(() => {
    cy.visit("");
  });

  describe("Interactions with the Diagram", () => {
    it("renders with 3 nodes", () => {
      cy.get("[data-testid='quantity-node'").should("have.length", 4);
    });

    it.skip("can connect nodes", () => {
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

    it.skip("cannot connect a node to itself", () => {
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

    it("can select and delete an edge", () => {
      selectedEdges().should("not.exist");
      connection(1).click({force: true});
      selectedEdges().should("have.length", 1);
      cy.get("body").type("{backspace}");
      selectedEdges().should("not.exist");
    });

    it("can select and delete a node", () => {
      selectedNodes().should("not.exist");
      node(1).click();
      selectedNodes().should("have.length", 1);
      // Clicking the pane should deselect any selected node or edge
      pane().click();
      selectedNodes().should("not.exist");
      nodes().should("have.length", 4);
      node(1).click();
      cy.get("body").type("{backspace}");
      nodes().should("have.length", 3);
    });
  });
});
