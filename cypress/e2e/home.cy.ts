import { requestLogin, seedBackend } from "./utils.cy";
import { project } from "../fixtures/variables";
import { adminUser } from "../fixtures/users";

describe("Home page", () => {
  beforeEach(() => {
    seedBackend();
  });

  it("should show a list of projects", () => {
    requestLogin(adminUser);
    cy.visit("/");
    cy.contains(project.name);
  });
});
