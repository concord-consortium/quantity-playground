import { connectionTarget, deleteEdgeButton, edge, edges, node, nodes, pane, selectedNodes, selectedEdges } from "../support/diagram-helpers";

context("Test Diagram interaction", () => {
  it("Interactions with the Diagram", () => {
    cy.visit("");

    cy.log("renders with 4 nodes");
    cy.get("[data-testid='quantity-node'").should("have.length", 4);

    cy.log("can connect nodes");
    cy.get("[data-testid='quantity-node']").eq(1)
      .find("[data-testid='variable-expression']")
      .should("not.exist");
    cy.get("[data-testid='quantity-node']").eq(0)
      .find("[title='drag to connect']")
      .trigger("pointerdown");
    cy.get("[data-testid='quantity-node']").eq(2)
      .trigger("pointermove")
      .trigger("pointerup")
      .find("[data-testid='variable-expression']")
      .should("exist");

    cy.log("cannot connect a node to itself");
    cy.get("[data-testid='quantity-node']").eq(0)
      .find("[data-testid='variable-expression']")
      .should("not.exist");
    cy.get("[data-testid='quantity-node']").eq(0)
      .find("[title='drag to connect']")
      .trigger("pointerdown");
    cy.get("[data-testid='quantity-node']").eq(0)
      .trigger("pointermove")
      .trigger("pointerup")
      .find("[data-testid='variable-expression']")
      .should("not.exist");

    cy.log("can select and delete an edge");
    selectedEdges().should("not.exist");
    connectionTarget(1).click({force: true});
    selectedEdges().should("have.length", 1);
    cy.get("body").type("{backspace}");
    selectedEdges().should("not.exist");

    cy.log("can select and delete a node");
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

    cy.log("can use delete button to delete an edge");
    edges().should("have.length", 1);
    edge(0).click();
    deleteEdgeButton(0).should("exist");
    deleteEdgeButton(0).click();
    edges().should("have.length", 0);
  });
});
