describe("Index Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the hero section", () => {
    cy.get("#hero").should("be.visible");
    cy.contains("Welcome to").should("be.visible");
    cy.contains("I Care Center - the Refuge Church").should("be.visible");
  });

  it("should have working navigation buttons in hero", () => {
    cy.contains("Join Us This Sunday").should("have.attr", "href", "/services");
    cy.contains("Learn More").should("have.attr", "href", "/about");
    cy.contains("Join Online").should("have.attr", "target", "_blank");
  });

  it("should display the about section", () => {
    cy.get("#about").should("be.visible");
    cy.contains("About Our Church").should("be.visible");
    // Check for the three values
    cy.contains("Love").should("be.visible");
    cy.contains("Community").should("be.visible");
    cy.contains("Faith").should("be.visible");
  });

  it("should display location information", () => {
    cy.get("#location").should("be.visible");
    cy.contains("Visit Us").should("be.visible");
    cy.contains("Faith Street").should("exist"); // Default value fallback check
    cy.screenshot("user/index/index-page");
  });
});
