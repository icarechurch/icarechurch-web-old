const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/ministries",
  "/events",
  "/sermons",
  "/contact",
  "/giving",
  "/gallery",
  "/auth",
];

describe("Public route characterization", () => {
  for (const route of publicRoutes) {
    it(`${route} resolves without a not-found page`, () => {
      cy.visit(route);
      cy.get("body").should("not.contain", "404");
      cy.get("body").should("not.contain", "Page Not Found");
    });
  }
});
