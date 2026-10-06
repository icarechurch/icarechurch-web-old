describe("About Page", () => {
  beforeEach(() => {
    cy.visit("/about");
  });

  it("presents the church history photo collection", () => {
    cy.contains("Our History").should("be.visible");
    cy.contains("Our Church").should("have.class", "text-black");
    cy.contains("Our Story").should("not.exist");
    cy.get('img[src^="/history%20of%20i%20care%20center%20-%20olongapo/"]').should(
      "have.length",
      15,
    );
    cy.get(
      'img[src^="/history%20of%20i%20care%20center%20-%20olongapo/"]',
    ).each(($image) => {
      expect($image).to.have.class("object-contain");
      expect($image).to.have.class("h-auto");
    });
  });
});
