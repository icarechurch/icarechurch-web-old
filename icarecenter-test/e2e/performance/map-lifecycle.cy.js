describe("Leaflet map lifecycle", () => {
  it("initializes the contact map container once", () => {
    cy.intercept("POST", "**/functions/v1/content-data", (request) => {
      const { resource } = request.body ?? {};

      if (resource === "church-info") {
        request.reply({
          body: {
            data: {
              id: "church-info",
              address: "2057 Jose Abad Santos Avenue",
              city: "Olongapo City",
              state: "Zambales",
              zip: "2200",
            },
          },
        });
        return;
      }

      request.reply({ body: { data: [] } });
    });

    cy.visit("/contact");
    cy.contains("Visit Us").should("be.visible");
    cy.get(".leaflet-container").should("be.visible");
  });
});
