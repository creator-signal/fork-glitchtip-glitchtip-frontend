import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Creator Signal authentication routes", () => {
  it("redirects password registration and recovery routes to login", () => {
    const routeSource = readFileSync("src/app/app.routes.ts", "utf8");
    expect(routeSource).toMatch(
      /path: "register",\s+redirectTo: "login",\s+pathMatch: "full"/,
    );
    expect(routeSource).toMatch(
      /path: "reset-password",\s+redirectTo: "login"/,
    );
    expect(routeSource).toContain(
      'import("../creativesignal/auth/creator-signal-login")',
    );
  });

  it("does not render password or public-registration controls", () => {
    const template = readFileSync(
      "src/creativesignal/auth/creator-signal-login.html",
      "utf8",
    );

    expect(template).not.toMatch(/<input|routerLink|Sign Up|Reset Password/);
    expect(template).toContain("Continue with ZITADEL");
  });

  it("preserves protected-route destinations through the OIDC callback", () => {
    const component = readFileSync(
      "src/creativesignal/auth/creator-signal-login.ts",
      "utf8",
    );

    expect(component).toContain('queryParamMap.get("next")');
    expect(component).toContain('callback.searchParams.set("next", nextUrl)');
  });
});
