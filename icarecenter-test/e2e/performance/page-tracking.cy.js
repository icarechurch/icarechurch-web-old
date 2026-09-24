describe("Public page tracking", () => {
  it("records a visit without requiring a consent key", () => {
    cy.intercept("POST", "**/functions/v1/analytics-data", (request) => {
      if (request.body?.operation === "track-visit") {
        request.reply({ body: { data: null } });
        return;
      }

      request.continue();
    }).as("trackVisit");

    cy.visit("/about", {
      onBeforeLoad(window) {
        window.localStorage.removeItem("analytics_consent");
      },
    });

    cy.wait("@trackVisit")
      .its("request.body")
      .should((body) => {
        expect(body.resource).to.equal("analytics");
        expect(body.operation).to.equal("track-visit");
        expect(body.input.page_path).to.equal("/about");
        expect(body.input.visitor_id).to.be.a("string");
        expect(body.input.session_id).to.be.a("string");
      });
  });
});
