import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";
import { UA } from "#test/user-agents.ts";

import { pixelRatioBucket, sessionData, viewportBucket } from "./session.utils.ts";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
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
  it("describes how the site is seen: window, density, theme and where it came from, in-app browser, version", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(390);
    vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(3);
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(UA.linkedin);
    document.documentElement.classList.add("dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(sessionData()).toEqual({
      viewport: "under 480px",
      pixelRatio: "3x",
      theme: "dark",
      themeSource: "picked",
      inApp: "linkedin",
      version: import.meta.env.APP_VERSION,
    });
  });

  it("says when the theme follows the device setting and the browser is an ordinary one", () => {
    expect(sessionData()).toMatchObject({ theme: "light", themeSource: "system", inApp: "none" });
  });

  it("names the site's version the page was loaded with: package.json's, as the footer shows it", () => {
    const { version } = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { version: string };
    expect(sessionData().version).toBe(version);
  });
});
