const protectedRoutes = ["/admin", "/moderator", "/profile", "/update-password"];

describe("Protected route characterization", () => {
  for (const route of protectedRoutes) {
    it(`${route} resolves to an application page or intentional auth redirect`, () => {
      cy.visit(route);
      cy.location("pathname").should("match", /^\/(auth|admin|moderator|profile|update-password)$/u);
      cy.get("body").should("not.contain", "404");
      cy.get("body").should("not.contain", "Page Not Found");
    });
  }
});
