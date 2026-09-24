describe("add user as admin", () => {
  it("should add user as admin", () => {
    cy.visit("/auth");

    cy.get('input[type="email"]').type("amdimate43@gmail.com");
    cy.get('input[type="password"]').type("password lolU");

    cy.url().should("include", "/admin");
    cy.get("Users").click();

    cy.get("Add User").click();
    cy.contains("Add New User").should("be.visible");
    cy.screenshot("admin/add-user");

    cy.get("input[type='name']").type("test user automated");
    cy.get("input[type='email']").type("foolsmasquerade.com");
    cy.get("input[type='password']").type("password lolU");
    cy.get('[data-cy="role-dropdown"]') // the <select> element
      .select("Admin") // the visible option text OR value
      .should("have.value", "admin"); // assert the selected value
  });
});
