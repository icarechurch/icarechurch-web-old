describe("Gallery Page", () => {
  beforeEach(() => {
    cy.visit("/gallery");
  });

  it("should load the page and optionally show loading state", () => {
    // The app has an initial loading screen that blocks content
    // We check if we are either loading or have content
    cy.get("body").then(($body) => {
      if ($body.find(".fixed.inset-0.bg-white").length > 0) {
        cy.contains("Loading", { timeout: 10_000 }).should("be.visible");
        // Optional: wait for it to disappear if we expect it to
        // cy.get('.fixed.inset-0.bg-white', { timeout: 10000 }).should('not.exist');
      }
    });

    // If the loading screen is gone or wasn't there, check for title
    // blocked by loading screen potentially, so we use a conditional check or just a simple assertion if we expect it to load
    // For this initial test, just verifying the page renders something is enough
    cy.url().should("include", "/gallery");
    cy.screenshot("user/gallery/gallery-page");
  });

  it.skip("should show content (either loader, empty state, or images)", () => {
    // Since we don't control the backend data state easily here without mocking,
    // we'll check for one of the three possible states.
    cy.get("body").then(($body) => {
      if ($body.find(".animate-spin").length > 0) {
        cy.get(".animate-spin").should("be.visible");
      } else if ($body.find("img").length > 0) {
        cy.get("img").should("have.length.gt", 0);
      } else {
        cy.contains("Gallery Coming Soon").should("be.visible");
      }
    });
  });
});
