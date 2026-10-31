import { afterEach, describe, expect, it } from "vitest";

import { UA } from "#test/user-agents.ts";

import { inAppBrowser, savesData } from "./browser.utils.ts";

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

describe("savesData", () => {
  const connect = (connection: object) =>
    Object.defineProperty(navigator, "connection", { value: connection, configurable: true });
  afterEach(() => Reflect.deleteProperty(navigator, "connection"));

  it("is true when the visitor asks to save data or is on 2G", () => {
    connect({ saveData: true, effectiveType: "4g" });
    expect(savesData()).toBe(true);
    connect({ effectiveType: "slow-2g" });
    expect(savesData()).toBe(true);
    connect({ effectiveType: "2g" });
    expect(savesData()).toBe(true);
  });

  it("is false on a faster connection and where the browser does not say", () => {
    connect({ saveData: false, effectiveType: "3g" });
    expect(savesData()).toBe(false);
    Reflect.deleteProperty(navigator, "connection");
    expect(savesData()).toBe(false);
  });
});
