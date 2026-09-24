describe("Static asset fallback", () => {
  it("does not route missing JavaScript assets through SSR HTML", () => {
    cy.readFile("../icarecenter-frontend/server.js").then((serverSource) => {
      expect(serverSource).to.include('req.path.startsWith("/assets/")');
      expect(serverSource).to.include("res.status(404)");
    });

    cy.readFile("../icarecenter-frontend/netlify.toml").then((netlifyConfig) => {
      expect(netlifyConfig).not.to.include('to = "/assets/:splat"');
    });
  });
});
