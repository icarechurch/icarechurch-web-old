describe("Frontend Edge request deduplication", () => {
  it("shares one church info request across the home page consumers", () => {
    let churchInfoRequests = 0;

    cy.intercept("POST", "**/functions/v1/content-data", (request) => {
      const { resource } = request.body ?? {};

      if (resource === "church-info") {
        churchInfoRequests += 1;
        request.reply({
          body: {
            data: {
              id: "church-info",
              church_name: "I Care Center - The Refuge Church",
              pastor_name: "Pastor",
            },
          },
        });
        return;
      }

      if (resource === "ministries") {
        request.reply({ body: { data: [] } });
        return;
      }

      if (resource === "events") {
        request.reply({ body: { data: [] } });
        return;
      }

      if (resource === "service-times") {
        request.reply({ body: { data: [] } });
      }
    });

    cy.visit("/");
    cy.contains("Welcome to").should("be.visible");
    cy.then(() => {
      expect(churchInfoRequests).to.equal(1);
    });
  });
});
