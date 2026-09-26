const fillContactForm = () => {
  cy.get('input[name="firstName"]').type("Ada");
  cy.get('input[name="lastName"]').type("Lovelace");
  cy.get('input[name="email"]').type("ada@example.com");
  cy.get('input[name="subject"]').type("Prayer request");
  cy.get('textarea[name="message"]').type("Please pray for our family.");
};

describe("Contact form", () => {
  it("submits the message and confirms delivery", () => {
    cy.intercept("POST", "**/functions/v1/contact-message", (request) => {
      expect(request.body.input).to.include({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        subject: "Prayer request",
        message: "Please pray for our family.",
      });
      request.reply({ statusCode: 200, body: { data: { sent: true } } });
    }).as("sendContactMessage");

    cy.visit("/contact");
    fillContactForm();
    cy.contains("button", "Send Message").click();

    cy.wait("@sendContactMessage");
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain", "Thank you for your message");
  });

  it("preserves the message when delivery fails", () => {
    cy.intercept("POST", "**/functions/v1/contact-message", {
      statusCode: 502,
      body: {
        error: {
          code: "CONTACT_MESSAGE_SEND_FAILED",
          message: "Unable to send your message right now",
        },
      },
    }).as("sendContactMessage");

    cy.visit("/contact");
    fillContactForm();
    cy.contains("button", "Send Message").click();

    cy.wait("@sendContactMessage");
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain", "Unable to send your message");
    cy.get('textarea[name="message"]').should(
      "have.value",
      "Please pray for our family.",
    );
  });
});
