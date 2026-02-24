const ORG = "gitbot-software";
const EMAIL = "rob.bot@gitbot-software.io";
const PASSWORD = "screenshot";
const VP_WIDTH = 1920;
const VP_HEIGHT = 1080;

function login() {
  cy.session("demo-user", () => {
    cy.visit("/login");
    cy.get("input[formcontrolname=email]").type(EMAIL);
    cy.get("input[formcontrolname=password]").type(PASSWORD);
    cy.get("#submit").click();
    cy.url().should("not.include", "/login");
  });
}

/** Force light mode via Chrome DevTools Protocol. */
function forceLightMode() {
  cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "Emulation.setEmulatedMedia",
      params: {
        features: [{ name: "prefers-color-scheme", value: "light" }],
      },
    }),
  );
}

/** Collapse the sidebar nav. */
function collapseNav() {
  cy.get("mat-sidenav").then(($nav) => {
    if (!$nav.hasClass("collapsed")) {
      cy.get(".collapse-toggle").click();
    }
  });
}

/**
 * Wait until no spinners/progress indicators are visible,
 * then pause briefly for chart animations to settle.
 */
function waitForPage(extraMs = 1500) {
  cy.get("mat-spinner", { timeout: 10000 }).should("not.exist");
  cy.get("mat-progress-spinner", { timeout: 10000 }).should("not.exist");
  cy.get("mat-progress-bar", { timeout: 10000 }).should("not.exist");
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(extraMs);
}

/**
 * Expand the viewport to match the full scroll height of
 * mat-sidenav-content so nothing is clipped, take the screenshot,
 * then reset the viewport back to normal.
 */
function captureFullPage(name: string) {
  cy.get("mat-sidenav-content").then(($el) => {
    const fullHeight = Math.max(VP_HEIGHT, $el[0].scrollHeight);
    cy.viewport(VP_WIDTH, fullHeight);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.screenshot(name);
    cy.viewport(VP_WIDTH, VP_HEIGHT);
  });
}

describe(
  "Screenshot all major GlitchTip pages",
  {
    viewportWidth: VP_WIDTH,
    viewportHeight: VP_HEIGHT,
    defaultCommandTimeout: 15000,
    retries: 0,
    screenshotOnRunFailure: false,
  },
  () => {
    beforeEach(() => {
      login();
      forceLightMode();
    });

    // ── Issues list ──────────────────────────────────────────────
    it("Issues list page", () => {
      cy.visit(`/${ORG}/issues`);
      cy.get("gt-issue-chart", { timeout: 15000 }).should("exist");
      waitForPage(2000);

      captureFullPage("01-issues-list-nav");

      collapseNav();
      waitForPage(500);

      captureFullPage("01-issues-list");
    });

    // ── Issue detail ─────────────────────────────────────────────
    it("Issue detail page", () => {
      cy.visit(`/${ORG}/issues`);
      cy.get(".title-cell a", { timeout: 15000 }).first().click();
      cy.url().should("match", /\/issues\/\d+/);

      cy.get("gt-event-detail", { timeout: 15000 }).should("exist");
      collapseNav();
      waitForPage(2000);

      captureFullPage("02-issue-detail");
    });

    // ── Performance / Transaction groups ─────────────────────────
    it("Performance page", () => {
      cy.visit(`/${ORG}/performance`);
      cy.get(".group-title", { timeout: 15000 }).should("have.length.gte", 1);
      collapseNav();
      waitForPage();

      captureFullPage("03-performance");
    });

    // ── Transaction group detail ─────────────────────────────────
    it("Transaction group detail page", () => {
      cy.visit(`/${ORG}/performance`);
      cy.get(".group-title a", { timeout: 15000 }).first().click();
      cy.url().should("match", /\/performance\/\d+/);

      cy.contains("Average Duration", { timeout: 15000 });
      collapseNav();
      waitForPage();

      captureFullPage("04-transaction-detail");
    });

    // ── Uptime Monitors list ─────────────────────────────────────
    it("Uptime Monitors page", () => {
      cy.visit(`/${ORG}/uptime-monitors`);
      cy.get(".table-group-label", { timeout: 15000 }).should(
        "have.length.gte",
        1,
      );
      collapseNav();
      waitForPage();

      captureFullPage("05-uptime-monitors");
    });

    // ── Monitor detail ───────────────────────────────────────────
    it("Monitor detail page", () => {
      cy.visit(`/${ORG}/uptime-monitors`);
      cy.get(".table-group-label", { timeout: 15000 }).first().click();
      cy.contains("Uptime details for", { timeout: 15000 });

      cy.get("gt-monitor-chart", { timeout: 15000 }).should("exist");
      collapseNav();
      waitForPage(2000);

      captureFullPage("06-monitor-detail");
    });

    // ── Logs ─────────────────────────────────────────────────────
    it("Logs page", () => {
      cy.visit(`/${ORG}/logs`);
      cy.get(".log-output", { timeout: 15000 }).should("exist");
      collapseNav();
      waitForPage();

      captureFullPage("07-logs");
    });

    // ── Settings > Projects list ─────────────────────────────────
    it("Projects settings page", () => {
      cy.visit(`/${ORG}/settings/projects`);
      cy.get("gt-project-card", { timeout: 15000 }).should(
        "have.length.gte",
        1,
      );
      collapseNav();
      waitForPage();

      captureFullPage("08-projects");
    });
  },
);
