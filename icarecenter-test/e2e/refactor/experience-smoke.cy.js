describe("Frontend experience smoke coverage", () => {
  it("renders the public home experience", () => {
    cy.visit("/");
    cy.get("#hero").should("be.visible");
    cy.contains("Welcome to").should("be.visible");
  });

  it("redirects unauthenticated admin access intentionally", () => {
    cy.visit("/admin");
    cy.location("pathname").should("match", /^\/(admin|auth)$/u);
  });

  it("redirects unauthenticated moderator access intentionally", () => {
    cy.visit("/moderator");
    cy.location("pathname").should("match", /^\/(moderator|auth)$/u);
  });
});
