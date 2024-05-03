import { seedBackend } from "./utils.cy";
import { registeringUser } from "../fixtures/users";

describe("Register", () => {
  it("should show validation errors", () => {
    cy.visit("/register");
    cy.get("#submit").click();
    cy.contains("email is required");
    cy.contains("password is required");
  });

  it("should allow registration", () => {
    seedBackend();

    cy.visit("/register");
    cy.get("input[formcontrolname=email]").type(registeringUser.email);
    cy.get("input[formcontrolname=password1]").type(registeringUser.password);
    cy.get("input[formcontrolname=password2]").type(registeringUser.password);
    cy.get("#submit").click();
    cy.url().should("eq", "http://localhost:4200/");
  });
});
