const events = [
  {
    id: "scheduled-event",
    title: "Scheduled Community Event",
    description: "An active event.",
    event_date: "2030-01-15",
    event_time: "10:00 AM",
    location: "Community Hall",
    image_url: null,
    status: "scheduled",
  },
  {
    id: "done-event",
    title: "Completed Community Event",
    description: "A completed event.",
    event_date: "2029-01-15",
    event_time: "10:00 AM",
    location: "Community Hall",
    image_url: null,
    status: "done",
  },
];

describe("Public event visibility", () => {
  it("hides completed events from Upcoming Events", () => {
    cy.intercept("POST", "**/functions/v1/content-data", (request) => {
      if (request.body?.resource !== "events") {
        return;
      }

      request.reply({ body: { data: events } });
    }).as("eventsRequest");

    cy.visit("/events");
    cy.wait("@eventsRequest");

    cy.contains("h3", "Scheduled Community Event").should("be.visible");
    cy.contains("h3", "Completed Community Event").should("not.exist");
  });
});
