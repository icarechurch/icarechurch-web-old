describe("Navigation menu ref forwarding", () => {
  it("renders the home page without React ref warnings", () => {
    cy.viewport(1600, 900);
    cy.visit("/", {
      onBeforeLoad(window) {
        cy.stub(window.console, "error").as("consoleError");
        cy.stub(window.console, "warn").as("consoleWarn");
      },
    });

    cy.contains("button", "Home").click({ force: true });
    cy.contains("a", "Welcome").should("exist");

    cy.get("@consoleError").should(
      "not.have.been.calledWithMatch",
      /Function components cannot be given refs/u,
    );
    cy.get("@consoleWarn").should(
      "not.have.been.calledWithMatch",
      /Function components cannot be given refs/u,
    );
  });
});
