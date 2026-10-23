import { describe, expect, it } from "vitest";

import { UA } from "#test/user-agents.ts";

import { inAppBrowser } from "./browser.utils.ts";

describe("inAppBrowser", () => {
  it("names the app behind Messenger, Facebook, Instagram and LinkedIn's built-in browsers", () => {
    expect(inAppBrowser(UA.messengerIos)).toBe("messenger");
    expect(inAppBrowser(UA.messengerAndroid)).toBe("messenger"); // it carries Facebook's marks too
    expect(inAppBrowser(UA.facebookAndroid)).toBe("facebook");
    expect(inAppBrowser(UA.instagram)).toBe("instagram");
    expect(inAppBrowser(UA.linkedin)).toBe("linkedin");
  });

  it("returns null for ordinary browsers", () => {
    for (const agent of [UA.chromeAndroid, UA.safariIos, UA.chromeDesktop])
      expect(inAppBrowser(agent), agent).toBeNull();
  });
});
