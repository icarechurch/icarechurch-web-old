describe("unauthenticated access login fail", () => {
  it("should say wrong password if wrong password", () => {
    cy.visit("/auth");

    // Use type="email" and type="password" selectors (no #id exists!)
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("wrongpassword");

    // Click the Sign In button
    cy.contains("Sign In").click();

    // Check for error message (matches your Auth.tsx toast message)
    cy.contains("Invalid email or password").should("be.visible");

    cy.screenshot("admin/wrong-password");
  });
});

describe("authenticated access check moderator", () => {
  it("should redirect to moderator and sign out", () => {
    // Visit authentication first
    cy.visit("/auth");

    // Login with credentials
    cy.get('input[type="email"]').type("marianne434343@gmail.com");
    cy.get('input[type="password"]').type("password lolU");

    // Click the Sign In button
    cy.contains("Sign In").click();

    // Wait for redirect and check we're on moderator page
    cy.url({ timeout: 10_000 }).should("include", "/moderator");
    cy.contains("Moderator Dashboard").should("be.visible");
    cy.screenshot("admin/moderator-dashboard");

    // Click the first "Sign Out" button (this opens the confirmation dialog)
    cy.contains("Sign Out").first().click();

    // Now the AlertDialog is open - check for the confirmation message
    cy.contains("Are you sure you want to sign out?").should("be.visible");
    cy.screenshot("admin/signout-dialog");

    // Click the confirmation "Sign Out" button INSIDE the dialog
    // Use the AlertDialogAction button which is inside the dialog
    cy.get('[role="alertdialog"]').within(() => {
      cy.contains("Sign Out").click();
    });

    // After signing out, should redirect to auth page
    cy.url({ timeout: 10_000 }).should("include", "/auth");
    cy.contains("Welcome Back").should("be.visible");
    cy.screenshot("admin/signed-out");
  });
});
