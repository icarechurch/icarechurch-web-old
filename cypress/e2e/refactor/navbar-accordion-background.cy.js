describe("Navbar accordion surface", () => {
  it("keeps the expanded mobile menu opaque", () => {
    cy.viewport(768, 900);
    cy.visit("/about");

    cy.get('button[aria-label="Open menu"]').click();
    cy.get("#mobile-site-menu").contains("button", "Home").click();
    cy.get("#mobile-site-menu").should(
      "have.css",
      "background-color",
      "rgb(255, 255, 255)",
    );

    cy.get("#mobile-site-menu").contains("a", "Welcome").should("be.visible");
  });
});
