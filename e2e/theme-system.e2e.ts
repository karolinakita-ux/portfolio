/**
 * The site follows the system light / dark setting (prefers-color-scheme) until the visitor picks
 * a theme: at first paint (the inline script in index.html, before the app runs), after React has
 * taken over, and live when the system setting changes. A pick is stored and wins, also over later
 * system changes and after a reload. With storage blocked the site falls back to the system setting
 * without page errors.
 */
import { expect, test, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes.ts";

import {
  appRan,
  blockScriptFiles,
  CANVAS,
  nextFrames,
  openView,
  THEME_STORAGE_KEY,
  themeButton,
  THEMES,
  waitForApp,
  type Theme,
} from "./helpers.ts";

const PATH = VIEW_PATHS[VIEW.about];

const opposite = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");

/** "#1a1a1a" → "rgb(26, 26, 26)": how every engine serialises an opaque computed colour. */
const rgb = (hex: string): string => {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
};

/** The theme as <html> carries it: the dark class and color-scheme (all the inline script sets). */
async function expectDocumentTheme(page: Page, theme: Theme): Promise<void> {
  const html = page.locator("html");
  if (theme === "dark") await expect(html).toHaveClass(/\bdark\b/);
  else await expect(html).not.toHaveClass(/\bdark\b/);
  await expect(html).toHaveCSS("color-scheme", theme);
}

/** The theme as the app shows it: <html>, the page background and the pressed toggle button. */
async function expectAppTheme(page: Page, theme: Theme): Promise<void> {
  await expectDocumentTheme(page, theme);
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(CANVAS[theme]));
  await expect(themeButton(page, theme)).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, opposite(theme))).toHaveAttribute("aria-pressed", "false");
}

/** The stored pick, null when there is none, "(blocked)" when storage throws. */
async function storedTheme(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return "(blocked)";
    }
  }, THEME_STORAGE_KEY);
}

/** The dark class on <html> right now (no waiting). */
async function documentIsDark(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.classList.contains("dark"));
}

/** Switches the emulated system setting and waits until the page sees it, plus a few frames for the app. */
async function setSystem(page: Page, theme: Theme): Promise<void> {
  await page.emulateMedia({ colorScheme: theme });
  await page.waitForFunction((dark) => matchMedia("(prefers-color-scheme: dark)").matches === dark, theme === "dark");
  await nextFrames(page, 5);
}

for (const system of THEMES) {
  test.describe(`system setting ${system}`, () => {
    test.use({ colorScheme: system });

    test("first paint follows it, before the app runs", async ({ page }) => {
      await blockScriptFiles(page);
      await page.goto(PATH);
      expect(await appRan(page), "the app bundle is blocked").toBe(false);
      await expectDocumentTheme(page, system);
    });

    test("after React: the same theme, nothing stored; live system changes are followed", async ({ page }) => {
      await openView(page, PATH, { theme: null });
      await expectAppTheme(page, system);
      expect(await storedTheme(page), "stored pick").toBeNull();

      await setSystem(page, opposite(system));
      // Already switched once setSystem() returns: the window the "pick wins" test relies on is long enough.
      expect(await documentIsDark(page), "followed within five frames").toBe(opposite(system) === "dark");
      await expectAppTheme(page, opposite(system));
      await setSystem(page, system);
      expect(await documentIsDark(page), "followed within five frames").toBe(system === "dark");
      await expectAppTheme(page, system);
      expect(await storedTheme(page), "stored pick").toBeNull();
    });

    test("a pick is stored and wins, over later system changes and after a reload", async ({ page }) => {
      const pick = opposite(system);
      await openView(page, PATH, { theme: null });
      await themeButton(page, pick).click();
      await expectAppTheme(page, pick);
      expect(await storedTheme(page), "stored pick").toBe(pick);

      await test.step("system changes no longer switch the theme", async () => {
        await setSystem(page, pick);
        await setSystem(page, system);
        expect(await documentIsDark(page), "still the pick five frames after the change").toBe(pick === "dark");
        await expectAppTheme(page, pick);
      });

      await test.step("reload: the pick wins at first paint and after React", async () => {
        const unblock = await blockScriptFiles(page);
        await page.reload();
        expect(await appRan(page), "the app bundle is blocked").toBe(false);
        await expectDocumentTheme(page, pick);
        await unblock();
        await page.reload();
        await waitForApp(page);
        await expectAppTheme(page, pick);
      });
    });

    test("storage blocked: follows the system, a pick still applies, no page errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });
      await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("The operation is insecure.", "SecurityError");
          },
        });
      });
      await openView(page, PATH, { theme: null });
      expect(await storedTheme(page), "storage").toBe("(blocked)");
      await expectAppTheme(page, system);
      await themeButton(page, opposite(system)).click();
      await expectAppTheme(page, opposite(system));
      expect(errors, "page errors").toEqual([]);
    });
  });
}
