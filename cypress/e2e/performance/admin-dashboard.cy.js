describe("Admin analytics request shape", () => {
  it("uses one overview query instead of independent analytics queries", () => {
    cy.task("getFrontendDataSources").then((sources) => {
      const analyticsPage = sources.find(({ filePath }) =>
        filePath.replaceAll("\\", "/").endsWith(
          "src/admin/analytics/pages/AdminAnalyticsPage.tsx",
        ),
      );

      expect(analyticsPage, "admin analytics page source").to.exist;
      expect(analyticsPage.source).to.include("useAnalyticsOverview");
      expect(analyticsPage.source).not.to.match(
        /useAnalyticsSummary|useDailyVisits|usePagePopularity|useRecentVisits|useContentAnalytics/u,
      );
    });
  });
});
