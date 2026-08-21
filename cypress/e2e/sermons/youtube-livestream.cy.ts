describe("YouTube public livestream", () => {
  const functionUrl = "**/functions/v1/youtube-livestream";
  const channelUrl = "https://www.youtube.com/@ICareCenter-media";

  beforeEach(() => {
    cy.intercept("OPTIONS", "**/functions/v1/**", {
      statusCode: 204,
      headers: {
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-origin": "*",
      },
    });
    cy.intercept("POST", "**/functions/v1/content-data", {
      body: { data: [] },
    });
    cy.intercept("POST", "**/functions/v1/**", {
      body: { data: [] },
    });
  });

  it("announces the loading state while the livestream request is pending", () => {
    cy.intercept("POST", functionUrl, {
      delay: 750,
      body: {
        data: { status: "offline", checkedAt: null },
      },
    }).as("youtubeLivestream");

    cy.visit("/sermons");
    cy.get("#livestream [role='status']")
      .should("be.visible")
      .and("contain", "Checking for a live stream");
    cy.wait("@youtubeLivestream");
  });

  it("renders a video-specific YouTube embed for a live response", () => {
    cy.intercept("POST", functionUrl, {
      body: {
        data: {
          status: "live",
          video: { id: "live-video-123", title: "Sunday service" },
          checkedAt: "2026-01-04T00:00:00.000Z",
        },
      },
    }).as("youtubeLivestream");

    cy.visit("/sermons");
    cy.wait("@youtubeLivestream");
    cy.get("#livestream iframe")
      .should("have.attr", "src", "https://www.youtube.com/embed/live-video-123")
      .and("have.attr", "title", "Watch Sunday service live on YouTube")
      .and("have.attr", "allowfullscreen")
      .and("not.have.attr", "autoplay");
    cy.get("#livestream").should("not.contain", "facebook.com");
  });

  it("renders an accessible offline state with a secure channel link", () => {
    cy.intercept("POST", functionUrl, {
      body: { data: { status: "offline", checkedAt: null } },
    }).as("youtubeLivestream");

    cy.visit("/sermons");
    cy.wait("@youtubeLivestream");
    cy.get("#livestream iframe").should("not.exist");
    cy.get("#livestream [role='status']")
      .should("be.visible")
      .and("contain", "not live right now");
    cy.get("#livestream a")
      .should("have.attr", "href", channelUrl)
      .and("have.attr", "target", "_blank")
      .and("have.attr", "rel", "noopener noreferrer");
  });

  it("renders the same accessible fallback when lookup fails", () => {
    cy.intercept("POST", functionUrl, {
      statusCode: 502,
      body: {
        error: {
          code: "YOUTUBE_LOOKUP_FAILED",
          message: "Unable to check for a live stream",
        },
      },
    }).as("youtubeLivestream");

    cy.visit("/sermons");
    cy.wait("@youtubeLivestream");
    cy.get("#livestream iframe").should("not.exist");
    cy.get("#livestream [role='status']")
      .should("be.visible")
      .and("contain", "temporarily unavailable");
    cy.get("#livestream a").should("have.attr", "href", channelUrl);
  });
});
