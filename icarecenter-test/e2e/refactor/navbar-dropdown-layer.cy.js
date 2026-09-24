describe("Navbar dropdown layer", () => {
  it("opens the desktop dropdown below its trigger with an opaque surface", () => {
    cy.viewport(1600, 900);
    cy.visit("/about");

    cy.contains("button", "Services").then(($trigger) => {
      const triggerBottom = $trigger[0].getBoundingClientRect().bottom;

      cy.wrap($trigger)
        .trigger("pointermove", { pointerType: "mouse" })
        .should("have.attr", "data-state", "open");
      cy.get("ul.bg-popover")
        .contains("a", "Service Times")
        .should("be.visible")
        .then(($link) => {
          const dropdown = $link[0].closest("ul.bg-popover");
          const dropdownRect = dropdown?.getBoundingClientRect();
          const backgroundColor = dropdown
            ? window.getComputedStyle(dropdown).backgroundColor
            : "";

          expect(dropdown).to.exist;
          expect(dropdownRect?.top).to.be.within(
            triggerBottom,
            triggerBottom + 8,
          );
          expect(backgroundColor).to.equal("rgb(255, 255, 255)");
        });
    });
  });
});
