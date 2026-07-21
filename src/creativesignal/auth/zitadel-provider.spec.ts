import { describe, expect, it } from "vitest";

import { selectZitadelProvider } from "./zitadel-provider";

describe("selectZitadelProvider", () => {
  it("selects only the configured zitadel provider ID", () => {
    const providers = [
      { name: "Another provider", provider: "openid_connect" },
      { name: "Creator Signal ZITADEL", provider: "zitadel" },
    ];

    expect(selectZitadelProvider(providers)).toEqual(providers[1]);
  });

  it("does not guess from a display name", () => {
    expect(
      selectZitadelProvider([
        { name: "ZITADEL lookalike", provider: "openid_connect" },
      ]),
    ).toBeUndefined();
  });
});
