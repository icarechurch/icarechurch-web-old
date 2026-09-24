describe("Frontend boundary architecture", () => {
  it("keeps domain modules independent from persona experiences", () => {
    cy.task("getFrontendDataSources").then((sources) => {
      const violations = sources.filter(({ filePath, source }) => {
        const normalizedPath = filePath.replaceAll("\\", "/");
        if (!normalizedPath.includes("/src/domains/")) return false;
        return /@\/(user|admin|moderator)\//u.test(source);
      });

      expect(violations).to.deep.equal([]);
    });
  });

  it("contains no imports from deleted legacy locations", () => {
    cy.task("getFrontendDataSources").then((sources) => {
      const legacyImport = /@\/(components|pages|hooks|integrations\/supabase\/services)\//u;
      expect(sources.filter(({ source }) => legacyImport.test(source))).to.deep.equal([]);
    });
  });
});
