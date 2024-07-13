import { seedBackend } from "./utils.cy";
import { adminUser } from "../fixtures/users";

describe("Login", () => {
  it("should show validation errors", () => {
    cy.visit("/login");
    cy.get("#submit").click();
    cy.contains("email is required");
    cy.contains("password is required");
  });

  it("should allow logging in", () => {
    seedBackend();

    cy.visit("/login");
    cy.get("input[formcontrolname=email]").type(adminUser.email);
    cy.get("input[formcontrolname=password]").type(adminUser.password);
    cy.get("#submit").click();
    cy.url().should("eq", "http://localhost:4200/");
  });
});
