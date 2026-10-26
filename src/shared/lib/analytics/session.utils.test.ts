import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";
import { UA } from "#test/user-agents.ts";

import { pixelRatioBucket, sessionData, viewportBucket, viewportHeightBucket } from "./session.utils.ts";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("viewportBucket", () => {
  it("groups the window width at the site's breakpoints", () => {
    expect([320, 479, 480, 767, 768, 1023, 1024, 1279, 1280, 2560].map(viewportBucket)).toEqual([
      "under 480px",
      "under 480px",
      "480 - 767px",
      "480 - 767px",
      "768 - 1023px",
      "768 - 1023px",
      "1024 - 1279px",
      "1024 - 1279px",
      "1280px or wider",
      "1280px or wider",
    ]);
  });
});

describe("viewportHeightBucket", () => {
  it("groups the window height by what fits on the first screen", () => {
    expect([360, 499, 500, 650, 699, 700, 844, 899, 900, 1099, 1100, 1440].map(viewportHeightBucket)).toEqual([
      "under 500px",
      "under 500px",
      "500 - 699px",
      "500 - 699px",
      "500 - 699px",
      "700 - 899px",
      "700 - 899px",
      "700 - 899px",
      "900 - 1099px",
      "900 - 1099px",
      "1100px or taller",
      "1100px or taller",
    ]);
  });
});

describe("pixelRatioBucket", () => {
  it("rounds the pixel density to the image sizes that matter", () => {
    expect([1, 1.25, 1.5, 2, 2.625, 3, 4].map(pixelRatioBucket)).toEqual([
      "1x",
      "1.5x",
      "1.5x",
      "2x",
      "3x",
      "3x",
      "3x",
    ]);
  });
});

describe("sessionData", () => {
  it("describes how the site is seen: window, density, theme and its source, in-app browser, version, link tag", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(390);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(664);
    vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(3);
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(UA.linkedin);
    document.documentElement.classList.add("dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    window.history.replaceState(null, "", "/work/automotive?ref=acme");
    expect(sessionData()).toEqual({
      viewport: "under 480px",
      viewportHeight: "500 - 699px",
      pixelRatio: "3x",
      theme: "dark",
      themeSource: "picked",
      inApp: "linkedin",
      version: import.meta.env.APP_VERSION,
      ref: "acme",
    });
  });

  it("says when the theme follows the device setting and the browser is an ordinary one", () => {
    expect(sessionData()).toMatchObject({ theme: "light", themeSource: "system", inApp: "none" });
  });

  it("leaves the link tag out without one, so Umami keeps the tag an earlier visit brought", () => {
    window.history.replaceState(null, "", "/about?fbclid=IwAR0abc");
    expect(sessionData()).not.toHaveProperty("ref");
    window.history.replaceState(null, "", "/about?utm_source=newsletter");
    expect(sessionData().ref).toBe("newsletter");
  });

  it("names the site's version the page was loaded with: package.json's, as the footer shows it", () => {
    const { version } = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { version: string };
    expect(sessionData().version).toBe(version);
  });
});
