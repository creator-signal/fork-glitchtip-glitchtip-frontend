import { requestLogin, seedBackend } from "./utils.cy";
import { seededOrg } from "../fixtures/variables";

describe("Organization Settings", () => {
  beforeEach(() => {
    seedBackend();
    requestLogin();
  });

  it("should update the org name, delete org and return to empty org state", function () {
    const newOrgName = "e2etestobj-other-org";
    cy.visit(`/${seededOrg.slug}/settings`);
    cy.contains(seededOrg.name);
    cy.get("input[formcontrolname=name]").clear().type(newOrgName);
    cy.get("#update-org").click();
    cy.get("input[formcontrolname=name]").should("have.value", newOrgName);
    cy.intercept("GET", `api/0/projects/*`).as("getProjectsRequest");
    cy.get("#delete-org").click();
    cy.get("[data-cy='dialog-confirm']").click();
    cy.contains("successfully deleted");
    cy.wait("@getProjectsRequest").then((interception) => cy.log("**Projects Response Body:**", JSON.stringify(interception?.response?.body)));
    cy.url().should("eq", "http://localhost:4200/");
    cy.contains("In order to use GlitchTip, you'll need to create an");
  });
});
