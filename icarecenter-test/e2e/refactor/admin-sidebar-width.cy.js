describe("Dashboard sidebar layout", () => {
  it("preserves the configured width and uses valid CSS variable utilities", () => {
    cy.task("getFrontendDataSources").then((sources) => {
      const adminLayout = sources.find(({ filePath }) =>
        filePath.replaceAll("\\", "/").endsWith(
          "icarecenter-frontend/src/admin/layout/AdminLayout.tsx",
        ),
      );
      const moderatorPage = sources.find(({ filePath }) =>
        filePath.replaceAll("\\", "/").endsWith(
          "icarecenter-frontend/src/moderator/pages/ModeratorPage.tsx",
        ),
      );
      const sidebar = sources.find(({ filePath }) =>
        filePath.replaceAll("\\", "/").endsWith(
          "icarecenter-frontend/src/shared/components/ui/sidebar.tsx",
        ),
      );

      expect(adminLayout, "admin layout source").to.exist;
      expect(moderatorPage, "moderator page source").to.exist;
      expect(sidebar, "sidebar source").to.exist;
      expect(adminLayout.source).to.include(
        'const sidebarStyle = { "--sidebar-width": "24rem" }',
      );
      expect(moderatorPage.source).to.include(
        'style={{ "--sidebar-width": "24rem" }',
      );
      expect(sidebar.source).to.include("w-[var(--sidebar-width)]");
      expect(sidebar.source).not.to.include("w-[--sidebar-width]");
    });
  });
});
