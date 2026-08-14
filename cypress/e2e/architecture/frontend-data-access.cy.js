describe("Frontend data access architecture", () => {
  it("keeps table queries and RPCs out of frontend data code", () => {
    cy.task("getFrontendDataSources").then((sources) => {
      const violations = sources.filter(({ filePath, source }) => {
        const hasTableQuery = /\.from\(\s*["'`]/u.test(source);
        const hasRpcCall = /\.rpc\(/u.test(source);

        if (!hasTableQuery && !hasRpcCall) return false;
        return !filePath.replaceAll("\\", "/").endsWith("infrastructure/supabase/storage.ts") || hasRpcCall;
      });

      expect(violations).to.deep.equal([]);
    });
  });
});
